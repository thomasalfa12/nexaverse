"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { contracts } from "@/lib/contracts";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import type { ClaimableRecord } from "@/types"; // Gunakan tipe data terpusat

interface ClaimStatus {
  isEligible: boolean;
  hasClaimed: boolean;
  canClaim: boolean;
  proof: `0x${string}`[] | null;
}

// KUNCI: Hook ini sekarang menerima `ClaimableRecord` langsung dari API
export function useMerkleClaim(record: ClaimableRecord) {
  const { address: userAddress } = useAccount();
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>({
    isEligible: false, hasClaimed: false, canClaim: false, proof: null,
  });

  const { data: hash, isPending, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const { data: hasClaimedData, refetch } = useReadContract({
    address: record.template.contractAddress as `0x${string}`,
    abi: contracts.merkleClaimSbt.abi,
    functionName: 'hasClaimed',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress }
  });

  useEffect(() => {
    if (!userAddress || !record.template.merkleRoot || !record.template.eligibleWallets) return;

    const merkleRoot = record.template.merkleRoot;
    const eligibleWallets = record.template.eligibleWallets as string[];
    
    const userAddrLower = userAddress.toLowerCase();
    const leaves = eligibleWallets.map(addr => keccak256(addr.toLowerCase()));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const leaf = keccak256(userAddrLower);
    const proof = tree.getHexProof(leaf) as `0x${string}`[];
    
    const isEligible = tree.verify(proof, leaf, Buffer.from(merkleRoot.slice(2), 'hex'));
    const hasClaimed = Boolean(hasClaimedData);

    setClaimStatus({
      isEligible,
      hasClaimed,
      canClaim: isEligible && !hasClaimed,
      proof: isEligible ? proof : null,
    });
  }, [userAddress, record, hasClaimedData]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Kredensial berhasil diklaim!");
      refetch();
    }
  }, [isConfirmed, refetch]);

  const claimSBT = async () => {
    if (!claimStatus.canClaim || !claimStatus.proof) {
      toast.error("Tidak dapat mengklaim kredensial ini.");
      return;
    }
    await writeContractAsync({
      address: record.template.contractAddress as `0x${string}`,
      abi: contracts.merkleClaimSbt.abi,
      functionName: 'claim',
      args: [claimStatus.proof],
    });
  };

  return { claimSBT, claimStatus, isPending, isConfirming };
}