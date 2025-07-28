"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { contracts } from "@/lib/contracts";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

interface ClaimCampaign {
  id: string;
  title: string;
  contractAddress: string;
  merkleRoot: string;
  metadataUri: string;
  eligibleWallets: string[];
  createdAt: string;
}

interface ClaimStatus {
  isEligible: boolean;
  hasClaimed: boolean;
  canClaim: boolean;
  proof: `0x${string}`[] | null;
  error?: string;
}

export function useMerkleClaim(contractAddress: `0x${string}`, campaign?: ClaimCampaign) {
  const { address: userAddress } = useAccount();
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>({
    isEligible: false,
    hasClaimed: false,
    canClaim: false,
    proof: null,
  });

  // Contract interactions
  const { data: hash, isPending, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Read contract state
  const { data: hasClaimedData, refetch: refetchHasClaimed } = useReadContract({
    address: contractAddress,
    abi: contracts.merkleClaimSbt.abi,
    functionName: 'hasClaimed',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress }
  });

  const { data: merkleRootData } = useReadContract({
    address: contractAddress,
    abi: contracts.merkleClaimSbt.abi,
    functionName: 'merkleRoot',
  });

  // Generate Merkle proof for user
  const generateProof = useCallback((userAddr: string, eligibleAddresses: string[]): `0x${string}`[] | null => {
    try {
      if (!eligibleAddresses.includes(userAddr.toLowerCase())) {
        return null;
      }

      const leaves = eligibleAddresses.map(addr => keccak256(addr.toLowerCase()));
      const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
      const leaf = keccak256(userAddr.toLowerCase());
      const proof = tree.getHexProof(leaf);
      
      return proof as `0x${string}`[];
    } catch (error) {
      console.error("Error generating proof:", error);
      return null;
    }
  }, []);

  // Verify proof on-chain
  const { data: canClaimData, refetch: refetchCanClaim } = useReadContract({
    address: contractAddress,
    abi: contracts.merkleClaimSbt.abi,
    functionName: 'canClaim',
    args: userAddress && claimStatus.proof ? [userAddress, claimStatus.proof] : undefined,
    query: { enabled: !!userAddress && !!claimStatus.proof }
  });

  // Update claim status when user address or campaign changes
  useEffect(() => {
    if (!userAddress || !campaign) {
      setClaimStatus({
        isEligible: false,
        hasClaimed: false,
        canClaim: false,
        proof: null,
        error: "Wallet not connected or campaign not loaded"
      });
      return;
    }

    const proof = generateProof(userAddress, campaign.eligibleWallets);
    const isEligible = proof !== null;
    const hasClaimed = Boolean(hasClaimedData);

    setClaimStatus({
      isEligible,
      hasClaimed,
      canClaim: isEligible && !hasClaimed,
      proof,
      error: !isEligible ? "Address not eligible for this credential" : undefined
    });
  }, [userAddress, campaign, hasClaimedData, generateProof]);

  // Update canClaim status from contract
  useEffect(() => {
    if (canClaimData !== undefined) {
      setClaimStatus(prev => ({
        ...prev,
        canClaim: Boolean(canClaimData)
      }));
    }
  }, [canClaimData]);

  // Handle successful claim
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Kredensial berhasil diklaim!", {
        description: "Token telah berhasil di-mint ke wallet Anda."
      });
      
      // Refresh contract state
      refetchHasClaimed();
      refetchCanClaim();
    }
  }, [isConfirmed, refetchHasClaimed, refetchCanClaim]);

  // Main claim function
  const claimSBT = async () => {
    if (!userAddress) {
      toast.error("Wallet tidak terhubung");
      return;
    }

    if (!claimStatus.canClaim) {
      toast.error("Tidak dapat mengklaim", {
        description: claimStatus.error || "Anda tidak memenuhi syarat atau sudah pernah klaim"
      });
      return;
    }

    if (!claimStatus.proof) {
      toast.error("Proof tidak valid");
      return;
    }

    try {
      const toastId = toast.loading("Mengirim transaksi klaim...");
      
      await writeContractAsync({
        address: contractAddress,
        abi: contracts.merkleClaimSbt.abi,
        functionName: 'claim',
        args: [claimStatus.proof],
      });

      toast.loading("Memproses transaksi...", { id: toastId });
    } catch (error) {
      console.error("Claim error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Transaksi Gagal", { 
        description: errorMessage 
      });
    }
  };

  // Batch claim verification for multiple addresses
  const verifyBatchEligibility = useCallback(async (addresses: string[]): Promise<Record<string, boolean>> => {
    if (!campaign) return {};

    const results: Record<string, boolean> = {};
    
    for (const address of addresses) {
      const proof = generateProof(address, campaign.eligibleWallets);
      results[address.toLowerCase()] = proof !== null;
    }

    return results;
  }, [campaign, generateProof]);

  // Get detailed claim information
  const getClaimInfo = useCallback(() => {
    if (!campaign || !userAddress) return null;

    return {
      campaignTitle: campaign.title,
      contractAddress,
      userAddress,
      eligibleCount: campaign.eligibleWallets.length,
      merkleRoot: campaign.merkleRoot,
      isEligible: claimStatus.isEligible,
      hasClaimed: claimStatus.hasClaimed,
      canClaim: claimStatus.canClaim,
      proof: claimStatus.proof,
      proofLength: claimStatus.proof?.length || 0,
    };
  }, [campaign, userAddress, contractAddress, claimStatus]);

  return {
    // Main claim function
    claimSBT,
    
    // Status
    claimStatus,
    isPending,
    isConfirming,
    isConfirmed,
    
    // Utilities
    verifyBatchEligibility,
    getClaimInfo,
    
    // Manual refresh functions
    refetchHasClaimed,
    refetchCanClaim,
    
    // Raw contract data for debugging
    hasClaimedData,
    canClaimData,
    merkleRootData,
  };
}

// Helper hook untuk load campaign data
export function useClaimCampaign(contractAddress: string) {
  const [campaign, setCampaign] = useState<ClaimCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCampaign = useCallback(async () => {
    if (!contractAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/campaigns/${contractAddress}`);
      if (!response.ok) {
        throw new Error('Campaign not found');
      }

      const data = await response.json();
      setCampaign(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load campaign';
      setError(errorMessage);
      toast.error("Gagal memuat campaign", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  return {
    campaign,
    isLoading,
    error,
    refetch: loadCampaign,
  };
}

// Combined hook untuk kemudahan penggunaan
export function useClaimCredential(contractAddress: `0x${string}`) {
  const { campaign, isLoading: campaignLoading, error: campaignError } = useClaimCampaign(contractAddress);
  const claimHook = useMerkleClaim(contractAddress, campaign || undefined);

  return {
    ...claimHook,
    campaign,
    campaignLoading,
    campaignError,
    isReady: !campaignLoading && !campaignError && !!campaign,
  };
}