"use client";

import Image from "next/image";
// FIX: Menghapus impor `toast` yang tidak terpakai.
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, Download } from "lucide-react";
import { useMerkleClaim } from "@/hooks/useMerkleClaims";
import type { ClaimableRecord } from "@/types";
import { formatIpfsUrl } from "@/utils/pinata";

export function ClaimCard({ record }: { record: ClaimableRecord }) {
  // FIX: Mengirim seluruh objek `record` ke dalam hook, bukan hanya `record.template`.
  // Hook `useMerkleClaim` dirancang untuk menerima seluruh objek `ClaimableRecord`.
  const { claimSBT, claimStatus, isPending, isConfirming } =
    useMerkleClaim(record); // FIX: Menggunakan seluruh `record` sebagai argumen

  const handleClaim = async () => {
    await claimSBT();
  };

  // Tentukan state tombol berdasarkan status dari hook
  const getButtonState = () => {
    if (claimStatus.hasClaimed) {
      return {
        text: "Sudah Diklaim",
        disabled: true,
        icon: <CheckCircle className="mr-2 h-4 w-4" />,
      };
    }
    if (isPending || isConfirming) {
      return {
        text: "Memproses...",
        disabled: true,
        icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" />,
      };
    }
    if (!claimStatus.isEligible) {
      return {
        text: "Tidak Berhak",
        disabled: true,
        icon: <AlertCircle className="mr-2 h-4 w-4" />,
      };
    }
    return {
      text: "Klaim Sekarang",
      disabled: false,
      icon: <Download className="mr-2 h-4 w-4" />,
    };
  };

  const buttonState = getButtonState();

  return (
    <div className="flex items-center gap-6 p-4 border rounded-lg bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      <div className="flex-shrink-0">
        {/* Menggunakan `record.template` untuk semua properti tampilan sudah benar */}
        <Image
          // Gunakan fungsi helper untuk mengubah URL
          src={formatIpfsUrl(record.template.imageUrl) || "/placeholder.png"}
          alt={record.template.title}
          width={100}
          height={100}
          className="rounded-md object-cover aspect-square"
        />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">
          Diterbitkan oleh: {record.template.creator.name}
        </p>
        <h3 className="text-lg font-semibold mt-1">{record.template.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {record.template.description}
        </p>
      </div>
      <div className="flex-shrink-0">
        <Button
          onClick={handleClaim}
          disabled={buttonState.disabled}
          className="w-40"
        >
          {buttonState.icon}
          {buttonState.text}
        </Button>
      </div>
    </div>
  );
}
