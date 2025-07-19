"use client";

import { useState, useTransition } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { contracts } from "@/lib/contracts";
import { Wallet, Copy, Check, Send, Loader2, Info } from "lucide-react";

export function RequestMintForm({ onSuccess }: { onSuccess?: () => void }) {
  const { address } = useAccount();
  const [isPending, startTransition] = useTransition();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const handleSubmit = () => {
    if (!address || !publicClient) {
      toast.error("Wallet belum terhubung atau provider tidak ditemukan.");
      return;
    }

    startTransition(async () => {
      try {
        toast.info("Silakan konfirmasi transaksi di wallet Anda...");
        const txHash = await writeContractAsync({
          address: contracts.institution.address,
          abi: contracts.institution.abi,
          functionName: "requestMint",
          args: [],
        });

        toast.loading("Mengirim permintaan on-chain, menunggu konfirmasi...", {
          id: "req-mint-tx",
        });

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });
        if (receipt.status === "reverted") {
          throw new Error("Transaksi on-chain gagal (reverted).");
        }

        toast.dismiss("req-mint-tx");
        toast.success("Permintaan on-chain berhasil dikonfirmasi!");

        const res = await fetch("/api/user/request-mint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, txHash }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data?.error || "Gagal menyimpan permintaan ke database."
          );
        }

        toast.success("Permintaan mint berhasil dicatat!");
        onSuccess?.();
      } catch (err: unknown) {
        // FIX: Gunakan `unknown` bukan `any` untuk type safety
        toast.dismiss("req-mint-tx");
        console.error("Mint request error", err);
        // Lakukan type check untuk mengakses properti .message dengan aman
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengajukan permintaan.";
        toast.error(errorMessage);
      }
    });
  };
  // State tambahan untuk UX tombol copy
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
      toast.success("Alamat Wallet disalin!");
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    // Mengganti Card dengan layout yang lebih terstruktur dan bersih.
    <div className="w-full max-w-lg mx-auto space-y-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-gray-600">
          Pendaftaran Anda telah diverifikasi oleh sistem. Langkah selanjutnya
          adalah mengajukan permintaan on-chain untuk pembuatan Soulbound Token
          (SBT) Anda.
        </p>
      </motion.div>

      {/* Blok Konfirmasi Wallet */}
      <motion.div
        className="space-y-2 text-left"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Label className="font-semibold">
          Permintaan akan dikirim dari wallet ini:
        </Label>
        <div className="flex items-center gap-2 rounded-lg border bg-gray-50/80 p-3 shadow-inner">
          <Wallet className="h-5 w-5 text-gray-500" />
          <span className="font-mono text-sm text-gray-800 flex-1 truncate">
            {address || "Wallet belum terhubung"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
            disabled={!address}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </motion.div>

      {/* Tombol Aksi Utama */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Button
          onClick={handleSubmit}
          disabled={isPending || !address}
          className="w-full text-base py-6 font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
          size="lg"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Send className="w-5 h-5 mr-2" />
          )}
          {isPending ? "Mengirim Transaksi..." : "Ajukan Permintaan Mint SBT"}
        </Button>
      </motion.div>

      {/* Info Langkah Selanjutnya */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Alert className="bg-blue-50 border-blue-200 text-blue-800">
          <Info className="h-4 w-4 !text-blue-600" />
          <AlertTitle className="font-bold">Langkah Selanjutnya</AlertTitle>
          <AlertDescription>
            Setelah permintaan dikirim, admin akan meninjau dan menyetujuinya.
            Anda akan dapat mengklaim token setelah proses ini selesai.
          </AlertDescription>
        </Alert>
      </motion.div>
    </div>
  );
}
