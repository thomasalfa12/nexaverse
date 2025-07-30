"use client";

import { useReadContract, useAccount } from "wagmi";
import { contracts } from "@/lib/contracts";

export function useOnchainEnrollment(courseContractAddress?: `0x${string}`) {
  const { address: userAddress } = useAccount();

  // KUNCI: Kita memanggil fungsi `balanceOf` dari standar ERC721.
  // Fungsi ini akan mengembalikan jumlah NFT (kredensial kursus) yang
  // dimiliki oleh pengguna. Jika > 0, berarti mereka sudah terdaftar.
  const { data: balance, isLoading, refetch } = useReadContract({
    address: courseContractAddress,
    abi: contracts.courseManager.abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    // Query hanya akan aktif jika kita memiliki alamat kontrak dan alamat pengguna
    query: { 
      enabled: !!courseContractAddress && !!userAddress,
      // Query hanya akan aktif jika kita memiliki alamat kontrak dan alamat pengguna
    },
  });

  // Logika untuk mengubah hasil `balanceOf` (bigint) menjadi `isEnrolled` (boolean)
  const isEnrolled = typeof balance === "bigint" && balance > 0n;

  return { 
    isEnrolled, 
    isLoading, 
    refetchEnrollment: refetch 
  };
}