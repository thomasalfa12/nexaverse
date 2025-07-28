"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
// FIX: Menghapus impor `TransactionReceipt` yang tidak terpakai.
import { parseEventLogs, type Log } from "viem";
import { contracts } from "@/lib/contracts";
import { prepareTemplateMetadataAction } from "@/lib/server/actions/prepareTemplateMetadataAction";
import { saveClaimCampaignAction } from "@/lib/server/actions/saveClaimCampaignAction";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

type CreateTemplateArgs = {
  title: string;
  symbol: string;
  description: string;
  image: File;
  addresses: string[];
  distributionMethod: "claim" | "airdrop";
};

type DecodedLog = Log & {
  args: { newContractAddress?: `0x${string}` }
}

export function useCreateTemplate({ onSuccess }: { onSuccess: () => void }) {
  const { address: userAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  // Gunakan publicClient untuk menunggu transaksi secara manual
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const createTemplate = async (values: CreateTemplateArgs) => {
    if (!userAddress) {
      toast.error("Dompet tidak terhubung.");
      return;
    }

    // FIX: Menambahkan pengecekan untuk memastikan publicClient tidak undefined.
    if (!publicClient) {
      toast.error("Gagal terhubung ke jaringan.", {
        description: "Silakan coba segarkan halaman.",
      });
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Mempersiapkan metadata...", {
      description: "Data sedang divalidasi dan diunggah ke IPFS...",
    });

    try {
      // ======================================================
      // LANGKAH 1: Persiapan Metadata (via Server Action)
      // ======================================================
      const formData = new FormData();
      (Object.keys(values) as Array<keyof CreateTemplateArgs>).forEach((key) => {
        const value = values[key];
        if (key === 'addresses' && Array.isArray(value)) {
          formData.append(key, value.join('\n'));
        } else if (value) {
          formData.append(key, value as string | File);
        }
      });

      const metadataResult = await prepareTemplateMetadataAction(formData);
      if (!metadataResult.success || !metadataResult.metadataURI) {
        throw new Error(metadataResult.error || "Gagal menyiapkan metadata.");
      }
      const { metadataURI } = metadataResult;

      // ======================================================
      // LANGKAH 2: Deploy Kontrak (Transaksi Pertama)
      // ======================================================
      toast.loading("Menunggu persetujuan untuk deploy kontrak...", { id: toastId });
      
      const factoryAbi = values.distributionMethod === 'claim' ? contracts.merkleClaimSbtFactory.abi : contracts.userSbtFactory.abi;
      const eventName = values.distributionMethod === 'claim' ? 'MerkleClaimSBTCreated' : 'SBTContractCreated';
      
      let deployTxHash: `0x${string}`;
      if (values.distributionMethod === 'claim') {
        const leaves = values.addresses.map(addr => keccak256(addr));
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const merkleRoot = tree.getHexRoot();

        deployTxHash = await writeContractAsync({
          address: contracts.merkleClaimSbtFactory.address,
          abi: factoryAbi,
          functionName: 'createMerkleClaimSBT',
          args: [values.title, values.symbol, merkleRoot, metadataURI, userAddress],
        });
      } else { // Airdrop
        deployTxHash = await writeContractAsync({
          address: contracts.userSbtFactory.address,
          abi: factoryAbi,
          functionName: 'createSbtContract',
          args: [values.title, values.symbol], // Argumen sudah benar (2)
        });
      }

      // ======================================================
      // LANGKAH 3: Tunggu Konfirmasi & Dapatkan Alamat Kontrak Baru
      // ======================================================
      toast.loading("Men-deploy kontrak... Menunggu konfirmasi on-chain.", { id: toastId, description: `Tx: ${deployTxHash.slice(0, 12)}...` });
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: deployTxHash });
      if (receipt.status === 'reverted') throw new Error("Transaksi deployment gagal.");

      const logs = parseEventLogs({ abi: factoryAbi, logs: receipt.logs, eventName });
      const newContractAddress = (logs[0] as DecodedLog).args.newContractAddress;
      if (!newContractAddress) throw new Error("Gagal mendapatkan alamat kontrak baru dari logs.");
      
      toast.success("Kontrak berhasil di-deploy!", { id: toastId, description: `Alamat: ${newContractAddress.slice(0,12)}...` });

      // ======================================================
      // LANGKAH 4: Eksekusi Distribusi
      // ======================================================
      if (values.distributionMethod === 'airdrop') {
        toast.loading("Memulai proses airdrop... Menunggu persetujuan transaksi kedua.", { id: toastId });
        
        const airdropTxHash = await writeContractAsync({
          address: newContractAddress,
          abi: contracts.userSbt.abi,
          functionName: 'mintBatch',
          args: [values.addresses, metadataURI, 0],
        });
        
        toast.loading("Airdrop sedang diproses... Menunggu konfirmasi.", { id: toastId, description: `Tx: ${airdropTxHash.slice(0, 12)}...` });
        
        const airdropReceipt = await publicClient.waitForTransactionReceipt({ hash: airdropTxHash });
        if (airdropReceipt.status === 'reverted') throw new Error("Transaksi airdrop gagal.");
        
        toast.success("Airdrop berhasil!", { id: toastId, description: "Semua token telah berhasil dikirim." });
      } else { // Claim
        toast.loading("Menyimpan daftar klaim ke database...", { id: toastId });
        const leaves = values.addresses.map(addr => keccak256(addr));
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const merkleRoot = tree.getHexRoot();
        
        const saveResult = await saveClaimCampaignAction({
            title: values.title,
            contractAddress: newContractAddress,
            merkleRoot,
            metadataUri: metadataURI,
            eligibleWallets: values.addresses
        });
        if (!saveResult.success) throw new Error(saveResult.error || "Gagal menyimpan kampanye klaim.");
        toast.success("Daftar Klaim Berhasil Dibuat!", { id: toastId });
      }
      
      onSuccess();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message.split('\n')[0] : "Terjadi kesalahan tidak diketahui.";
      toast.error("Proses Gagal", { id: toastId, description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = useCallback(() => {
    setIsLoading(false);
  }, []);

  return { createTemplate, isLoading, resetState };
}