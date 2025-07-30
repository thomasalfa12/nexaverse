"use client";

import { useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { contracts } from "@/lib/contracts"; // Asumsi ada file contracts.ts yang berisi ABI kontrak

export function useEnroll(
  contractAddress: `0x${string}`,
  priceInEth: string
) {
  const { 
    data: hash, 
    isPending, // true saat dompet pop-up terbuka
    writeContractAsync 
  } = useWriteContract();

  const enroll = async () => {
    try {
      // Konversi harga dari string ETH (misal "0.05") menjadi wei (bigint)
      const priceInWei = parseEther(priceInEth);

      // KUNCI: Saat memanggil writeContractAsync untuk fungsi `payable`,
      // kita harus menyertakan properti `value` yang berisi jumlah wei
      // yang akan dikirim bersama transaksi.
      await writeContractAsync({
        address: contractAddress,
        abi: contracts.courseManager.abi, // Asumsi ABI ada di contracts.ts
        functionName: 'enrollWithETH',
        // Tidak ada `args` karena fungsi `enrollWithETH` di kontrak tidak memiliki argumen
        args: [], 
        value: priceInWei, // Ini adalah bagian yang paling penting
      });

    } catch (error) {
      // Tangani error jika pengguna menolak transaksi di dompet
      const errorMessage = (error as Error).message.includes("User rejected the request")
        ? "Transaksi dibatalkan oleh pengguna."
        : (error as Error).message;
        
      toast.error("Pendaftaran Gagal", {
        description: errorMessage,
      });
      console.error("Enrollment error:", error);
    }
  };

  return {
    enroll,
    hash,
    isPending,
    // Kita bisa mendapatkan status konfirmasi dari `PricingBox`
    // menggunakan `useWaitForTransactionReceipt({ hash })`
  };
}
