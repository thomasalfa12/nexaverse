// hooks/useUpdateCourse.ts (FILE BARU)

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { contracts } from "@/lib/contracts"; // Pastikan berisi ABI NexaCourse

export function useUpdateCourse() {
  const { writeContractAsync } = useWriteContract();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message.split('\n')[0] : "Terjadi kesalahan.";
    toast.error("Update Gagal", { description: errorMessage });
  };

  const updatePrice = async (courseAddress: `0x${string}`, newPrice: string) => {
    setIsUpdating(true);
    try {
      await writeContractAsync({
        address: courseAddress,
        abi: contracts.nexaCourse.abi, // ABI dari kontrak logika
        functionName: 'updatePrice',
        args: [parseEther(newPrice)],
      });
      toast.success("Harga berhasil diperbarui!");
    } catch (error) {
      handleError(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePaymentToken = async (courseAddress: `0x${string}`, newTokenAddress: `0x${string}`) => {
    setIsUpdating(true);
    try {
      await writeContractAsync({
        address: courseAddress,
        abi: contracts.nexaCourse.abi,
        functionName: 'updatePaymentToken',
        args: [newTokenAddress],
      });
      toast.success("Token pembayaran berhasil diubah!");
    } catch (error) {
      handleError(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return { isUpdating, updatePrice, updatePaymentToken };
}
