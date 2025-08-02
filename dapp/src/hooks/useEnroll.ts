// hooks/useEnroll.ts (Dioptimalkan untuk ETH & ERC20)

"use client";

import { useWriteContract, useAccount } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { contracts } from "@/lib/contracts";

// Tipe untuk argumen, sekarang menyertakan paymentToken opsional
type EnrollArgs = {
  contractAddress: `0x${string}`;
  price: string;
  paymentToken?: `0x${string}`;
};

export function useEnroll() {
  const { address: userAddress } = useAccount();
  const { 
    data: hash, 
    isPending,
    writeContractAsync 
  } = useWriteContract();

  const enroll = async ({ contractAddress, price, paymentToken }: EnrollArgs) => {
    if (!userAddress) {
      toast.error("Dompet tidak terhubung.");
      return;
    }

    try {
      const isEthPayment = !paymentToken || paymentToken === "0x0000000000000000000000000000000000000000";
      const priceInWei = parseEther(price);

      if (isEthPayment) {
        // Logika untuk pembayaran dengan ETH
        await writeContractAsync({
          address: contractAddress,
          abi: contracts.nexaCourse.abi, // Menggunakan ABI logika yang benar
          functionName: 'enrollWithETH',
          value: priceInWei, // Mengirim ETH bersama transaksi
        });
      } else {
        toast.info("Meminta persetujuan untuk menggunakan token Anda...");

        await writeContractAsync({
          address: contractAddress,
          abi: contracts.nexaCourse.abi,
          functionName: 'enrollWithToken',
          // Fungsi ini tidak payable, jadi tidak ada `value`
        });
        toast.success("Pendaftaran dengan token berhasil!");
      }

    } catch (error) {
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
  };
}
