"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { parseEther } from "viem";
import { contracts } from "@/lib/contracts"; // Impor konfigurasi terpusat

export function useEnroll(courseContractAddress: `0x${string}`, priceInEth: string) {
    const { data: hash, error, isPending, writeContract } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = 
        useWaitForTransactionReceipt({ hash });

    const enroll = () => {
        writeContract({
            address: courseContractAddress,
            // FIX: Menggunakan ABI yang lengkap dan benar dari contracts.ts
            abi: contracts.courseManager.abi,
            functionName: 'enroll',
            value: parseEther(priceInEth), 
        });
    };

    if (error) {
        toast.error("Transaksi Gagal", { description: error.message });
    }

    return {
        enroll,
        isPending,
        isConfirming,
        isConfirmed,
        hash,
    };
}