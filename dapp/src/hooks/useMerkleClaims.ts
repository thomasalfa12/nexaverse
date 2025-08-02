"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { contracts } from "@/lib/contracts";
import type { ClaimableRecord } from "@/types";

interface ClaimStatus {
  isEligible: boolean; // Apakah user berhak berdasarkan proof dari server
  hasClaimed: boolean; // Apakah user sudah pernah klaim on-chain
  canClaim: boolean;   // Apakah tombol klaim bisa diklik
  proof: `0x${string}`[] | null;
}

export function useMerkleClaim(record?: ClaimableRecord) { // Dibuat opsional agar tidak error saat render awal
  const { address: userAddress } = useAccount();
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>({
    isEligible: false, hasClaimed: false, canClaim: false, proof: null,
  });
  // State baru untuk melacak proses pengambilan proof
  const [isFetchingProof, setIsFetchingProof] = useState(true);

  const { data: hash, isPending, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // FIX: Mengakses alamat kontrak dari `record.credential`
  const contractAddress = record?.credential.contractAddress as `0x${string}` | undefined;

  // Langkah 1: Cek status klaim on-chain (ini sudah benar)
  const { data: hasClaimedData, refetch: refetchHasClaimed } = useReadContract({
    address: contractAddress,
    abi: contracts.merkleClaimSbt.abi,
    functionName: 'hasClaimed',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress && !!contractAddress }
  });

  // Langkah 2: Ambil Merkle Proof dari server (lebih aman dan efisien)
  useEffect(() => {
    if (!userAddress || !record) {
      setIsFetchingProof(false);
      return;
    }

    const fetchProof = async () => {
      setIsFetchingProof(true);
      setClaimStatus(prev => ({ ...prev, isEligible: false, proof: null })); // Reset status kelayakan
      try {
        // Panggil API endpoint yang sudah kita buat
        const res = await fetch(`/api/me/claims/${record.credential.id}/proof`);
        
        if (!res.ok) {
          // Jika API mengembalikan error (403/404), artinya user tidak berhak
          throw new Error("Anda tidak berhak untuk mengklaim kredensial ini.");
        }

        const { proof } = await res.json();
        // Jika berhasil, user berhak dan kita simpan proof-nya
        setClaimStatus(prev => ({ ...prev, isEligible: true, proof: proof as `0x${string}`[] }));
      } catch (error) {
        // Jika gagal, status isEligible akan tetap false
        console.warn((error as Error).message);
      } finally {
        setIsFetchingProof(false);
      }
    };

    fetchProof();
  }, [userAddress, record]);

  // Langkah 3: Gabungkan data on-chain dan data dari server
  useEffect(() => {
    const hasClaimed = Boolean(hasClaimedData);
    setClaimStatus(prev => ({
      ...prev,
      hasClaimed,
      canClaim: prev.isEligible && !hasClaimed,
    }));
  }, [hasClaimedData, claimStatus.isEligible]);
  
  // Langkah 4: Tampilkan notifikasi setelah transaksi terkonfirmasi
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Kredensial berhasil diklaim!");
      refetchHasClaimed(); // Ambil ulang status on-chain
    }
  }, [isConfirmed, refetchHasClaimed]);

  const claimSBT = async () => {
    if (!claimStatus.canClaim || !claimStatus.proof) {
      toast.error("Tidak dapat mengklaim kredensial ini.");
      return;
    }
    
    await writeContractAsync({
      address: contractAddress!,
      abi: contracts.merkleClaimSbt.abi,
      functionName: 'claim',
      // FIX: Fungsi `claim` biasanya membutuhkan alamat penerima dan proof-nya
      args: [userAddress, claimStatus.proof],
    });
  };
  
  // Gabungkan semua kondisi loading menjadi satu
  const isLoading = isPending || isConfirming || isFetchingProof;

  return { claimSBT, claimStatus, isLoading };
}
