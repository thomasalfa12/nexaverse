"use client";

import { useWriteContract, useAccount, useConfig, useWaitForTransactionReceipt } from "wagmi";
import { readContract } from "wagmi/actions";
import { parseEther, BaseError, ContractFunctionRevertedError } from "viem";
import { toast } from "sonner";
import { contracts } from "@/lib/contracts";
import { useState, useEffect, useCallback } from "react";

type EnrollArgs = {
  courseId: string;
  contractAddress: `0x${string}`;
  price: string;
  paymentToken?: `0x${string}`;
};

type EnrollmentStatus = 'idle' | 'checking' | 'enrolling' | 'confirming' | 'syncing' | 'success' | 'error';

export function useEnroll() {
  const { address: userAddress } = useAccount();
  const wagmiConfig = useConfig();
  const [status, setStatus] = useState<EnrollmentStatus>('idle');
  const [currentCourseId, setCurrentCourseId] = useState<string>('');
  
  const { 
    data: hash, 
    isPending: isWritePending,
    writeContractAsync,
    reset: resetWrite
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    isError: isConfirmError 
  } = useWaitForTransactionReceipt({ hash });

  const syncEnrollmentData = useCallback(async (courseId: string, maxRetries = 3) => {
    setStatus('syncing');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`/api/courses/${courseId}/sync-enrollment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const result = await response.json();
          setStatus('success');
          toast.success("Pendaftaran berhasil dan data telah disinkronkan!");
          
          // Trigger global event untuk update UI
          window.dispatchEvent(new CustomEvent('enrollmentSynced', { 
            detail: { courseId, result } 
          }));
          
          setTimeout(() => window.location.reload(), 2000);
          return true;
        }
        
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Sync failed: ${errorData.error || response.status}`);
      } catch (error) {
        console.error(`Sync attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          setStatus('error');
          toast.error("Gagal sinkronisasi data", {
            description: "Transaksi mungkin berhasil. Coba muat ulang halaman.",
            action: { label: "Muat Ulang", onClick: () => window.location.reload() }
          });
          return false;
        }
        
        // Exponential backoff dengan jitter
        const delay = 1000 * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return false;
  }, []);

  // Auto-sync setelah transaksi dikonfirmasi
  useEffect(() => {
    if (isConfirmed && currentCourseId && status === 'confirming') {
      syncEnrollmentData(currentCourseId);
    }
  }, [isConfirmed, currentCourseId, status, syncEnrollmentData]);

  // Handle confirmation error
  useEffect(() => {
    if (isConfirmError && status === 'confirming') {
      setStatus('error');
      toast.error("Transaksi gagal dikonfirmasi di blockchain.");
    }
  }, [isConfirmError, status]);

  const checkOnChainEnrollment = async (contractAddress: `0x${string}`) => {
    if (!userAddress) return false;
    try {
      const isEnrolled = await readContract(wagmiConfig, {
        address: contractAddress,
        abi: contracts.nexaCourse.abi,
        functionName: 'isEnrolled',
        args: [userAddress],
      });
      return isEnrolled as boolean;
    } catch (error) {
      console.warn("Failed to check on-chain enrollment:", error);
      return false;
    }
  };

  const enroll = async ({ courseId, contractAddress, price, paymentToken }: EnrollArgs) => {
    if (!userAddress) {
      toast.error("Dompet tidak terhubung.");
      return;
    }

    try {
      resetWrite();
      setCurrentCourseId(courseId);
      setStatus('checking');
      
      const loadingToast = toast.loading("Memeriksa status pendaftaran on-chain...");

      // Pengecekan proaktif
      const alreadyEnrolled = await checkOnChainEnrollment(contractAddress);
      if (alreadyEnrolled) {
        toast.dismiss(loadingToast);
        toast.info("Status Desinkronisasi Terdeteksi", {
          description: "Anda sudah terdaftar on-chain. Menyinkronkan data..."
        });
        await syncEnrollmentData(courseId);
        return;
      }

      toast.dismiss(loadingToast);
      setStatus('enrolling');
      
      const isEthPayment = !paymentToken || paymentToken === "0x0000000000000000000000000000000000000000";
      const priceInWei = parseEther(price);

      if (isEthPayment) {
        toast.info("Buka dompet Anda untuk konfirmasi pembayaran...");
      } else {
        toast.info("Meminta persetujuan token...");
      }

      await writeContractAsync({
        address: contractAddress,
        abi: contracts.nexaCourse.abi,
        functionName: isEthPayment ? 'enrollWithETH' : 'enrollWithToken',
        ...(isEthPayment && { value: priceInWei }),
      });
      
      setStatus('confirming');
      toast.info("Transaksi dikirim, menunggu konfirmasi blockchain...");

    } catch (error: unknown) {
      console.error("Enrollment error:", error);
      setStatus('error');
      
      // Enhanced error handling
      if (error instanceof BaseError) {
        const revertError = error.walk(err => err instanceof ContractFunctionRevertedError);
        
        if (revertError instanceof ContractFunctionRevertedError) {
          // FIX: Gunakan shortMessage daripada errorName untuk kompatibilitas
          const errorMessage = revertError.shortMessage;

          if (errorMessage.includes("AlreadyEnrolled")) {
            toast.info("Deteksi Desinkronisasi", {
              description: "Anda sudah terdaftar on-chain. Menyinkronkan data..."
            });
            await syncEnrollmentData(courseId);
            return;
          } else if (errorMessage.includes("CourseInactive")) {
            toast.error("Kursus Tidak Aktif", { 
              description: "Pendaftaran untuk kursus ini sedang ditutup." 
            });
            return;
          } else if (errorMessage.includes("InsufficientPayment")) {
            toast.error("Pembayaran Tidak Cukup", { 
              description: `Diperlukan ${price} ETH untuk mendaftar.` 
            });
            return;
          } else if (errorMessage.includes("WrongPaymentMethod")) {
            toast.error("Metode Pembayaran Salah", { 
              description: "Gunakan metode pembayaran yang sesuai untuk kursus ini." 
            });
            return;
          }
        }
      }
      
      // Handle user rejection dan error umum
      const errorMessage = (error as Error).message;
      if (errorMessage.includes("User rejected") || errorMessage.includes("user rejected")) {
        toast.error("Transaksi dibatalkan oleh pengguna.");
      } else {
        toast.error("Transaksi Gagal", {
          description: "Terjadi error yang tidak diketahui. Silakan coba lagi.",
        });
      }
    }
  };

  return {
    enroll,
    hash,
    status,
    isLoading: status === 'checking' || status === 'enrolling' || isWritePending || isConfirming || status === 'syncing',
    isSuccess: status === 'success',
    resetEnrollment: () => {
      resetWrite();
      setStatus('idle');
      setCurrentCourseId('');
    }
  };
}