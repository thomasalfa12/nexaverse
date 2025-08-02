// hooks/useOnchainEnrollment.ts (Dioptimalkan)

"use client";

import { useReadContract, useAccount } from "wagmi";
import { contracts } from "@/lib/contracts";

export function useOnchainEnrollment(courseContractAddress?: `0x${string}`) {
  const { address: userAddress } = useAccount();

  // KUNCI: Kita memanggil fungsi `getStudentInfo` yang lebih efisien.
  // Fungsi ini secara eksplisit dibuat untuk mengecek status pendaftaran
  // dan mengembalikan boolean secara langsung.
  const { data, isLoading, refetch } = useReadContract({
    address: courseContractAddress,
    abi: contracts.nexaCourse.abi, // Menggunakan ABI logika yang benar
    functionName: 'getStudentInfo',
    args: userAddress ? [userAddress] : undefined,
    query: { 
      enabled: !!courseContractAddress && !!userAddress,
    },
  });

  // `data` akan berupa array: [isEnrolled (boolean), tokenId (bigint)]
  // Kita hanya perlu mengambil elemen pertama.
  const isEnrolled = Array.isArray(data) ? data[0] : false;

  return { 
    isEnrolled, 
    isLoading, 
    refetchEnrollment: refetch 
  };
}
