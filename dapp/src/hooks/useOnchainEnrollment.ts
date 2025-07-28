"use client";
import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { contracts } from "@/lib/contracts"; // Impor konfigurasi terpusat

export function useOnchainEnrollment(courseContractAddress?: `0x${string}`) {
  const { address: userAddress } = useAccount();

  const { data: isEnrolled, isLoading, refetch } = useReadContract({
    address: courseContractAddress,
    // FIX: Menggunakan ABI yang lengkap dan benar dari contracts.ts
    abi: contracts.courseManager.abi,
    functionName: 'checkEnrollment',
    args: [userAddress],
    query: { enabled: !!courseContractAddress && !!userAddress },
  });

  return { isEnrolled: isEnrolled as boolean, isLoading, refetchEnrollment: refetch };
}