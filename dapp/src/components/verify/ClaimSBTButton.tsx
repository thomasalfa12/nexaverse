"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { motion } from "framer-motion";

// Komponen & Ikon
import { contracts } from "@/lib/contracts";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Award,
  PartyPopper,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

// Komponen baru yang didedikasikan untuk menampilkan keberhasilan
const ClaimSuccessView = ({
  hash,
  onSuccess,
}: {
  hash: `0x${string}`;
  onSuccess?: () => void;
}) => {
  // Panggil onSuccess setelah animasi selesai agar transisi ke step berikutnya lebih mulus
  useEffect(() => {
    const timer = setTimeout(() => {
      onSuccess?.();
    }, 3000); // Beri waktu 3 detik bagi pengguna untuk menikmati perayaan
    return () => clearTimeout(timer);
  }, [onSuccess]);

  const explorerUrl = `https://sepolia.basescan.org/tx/${hash}`;

  return (
    <motion.div
      className="text-center p-4 sm:p-6 bg-green-50 border-2 border-dashed border-green-200 rounded-xl flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <PartyPopper className="h-12 w-12 text-green-500 mb-4" />
      <h3 className="text-xl font-bold text-green-900">
        SBT Berhasil Diklaim!
      </h3>
      <p className="text-green-700 mt-1 mb-4 text-sm">
        Selamat! Soulbound Token Anda kini aman di dalam wallet Anda.
      </p>

      {/* Tautan ke Block Explorer - Fitur UX Penting di Web3 */}
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center text-xs text-green-600 hover:text-green-800 hover:underline transition-colors"
      >
        Lihat Transaksi di BaseScan
        <ExternalLink className="h-3 w-3 ml-1.5" />
      </a>
    </motion.div>
  );
};

export function ClaimSBTButton({ onSuccess }: { onSuccess?: () => void }) {
  // --- SEMUA LOGIKA ANDA TETAP SAMA, TIDAK ADA PERUBAHAN ---
  const { address } = useAccount();
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined);
  const { writeContractAsync } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });
  const [pending, startTransition] = useTransition();

  async function handleClaim() {
    if (!address) return;
    startTransition(async () => {
      try {
        const txHash = await writeContractAsync({
          address: contracts.institution.address,
          abi: contracts.institution.abi,
          functionName: "claim",
          args: [],
        });
        toast.success("Transaksi klaim terkirim!");
        setHash(txHash);
        // onSuccess tidak dipanggil di sini lagi, tapi di dalam SuccessView
      } catch (err) {
        console.error(err);
        toast.error("Gagal klaim token.");
      }
    });
  }
  // --- AKHIR DARI BLOK LOGIKA YANG TIDAK DIUBAH ---

  // Jika sudah sukses, tampilkan komponen perayaan
  if (isSuccess && hash) {
    return <ClaimSuccessView hash={hash} onSuccess={onSuccess} />;
  }

  // Tampilan default sebelum atau selama proses klaim
  return (
    <div className="w-full max-w-lg mx-auto space-y-4 text-center p-4 bg-gray-50 rounded-xl border">
      <div className="flex justify-center">
        <div className="p-3 bg-green-100 rounded-full">
          <Award className="h-8 w-8 text-green-600" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-800">Satu Langkah Terakhir</h3>
      <p className="text-sm text-gray-600 max-w-md mx-auto">
        Permintaan Anda telah disetujui oleh admin. Klik tombol di bawah untuk
        mengklaim Soulbound Token (SBT) Anda secara on-chain.
      </p>
      <div className="pt-2">
        <Button
          onClick={handleClaim}
          disabled={pending || isLoading}
          className="w-full text-base py-6 font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
          size="lg"
        >
          {pending || isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Mengklaim di Blockchain...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5 mr-2" />
              Klaim SBT Sekarang
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
