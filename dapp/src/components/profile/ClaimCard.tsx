"use client";
import type { ClaimableRecord } from "@/types";
import { Button } from "@/components/ui/button";
import { useMerkleClaim } from "@/hooks/useMerkleClaims";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const toGatewayURL = (ipfsUri: string) => {
  if (ipfsUri && ipfsUri.startsWith("ipfs://"))
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  return ipfsUri;
};

export function ClaimCard({ record }: { record: ClaimableRecord }) {
  const [isFetchingProof, setIsFetchingProof] = useState(false);
  const { claimSBT, isPending, isConfirming } = useMerkleClaim(
    record.template.contractAddress as `0x${string}`
  );

  const handleClaim = async () => {
    setIsFetchingProof(true);
    const toastId = toast.loading("Meminta bukti dari server...");
    try {
      // `record.templateId` adalah ID dari kampanye
      const res = await fetch(`/api/me/claims/${record.templateId}/proof`);
      if (!res.ok) throw new Error("Gagal mendapatkan bukti klaim.");
      const { proof } = await res.json();

      toast.loading("Bukti diterima. Mengirim transaksi...", { id: toastId });
      await claimSBT(proof);
    } catch (err) {
      toast.error("Gagal", {
        id: toastId,
        description: (err as Error).message,
      });
    } finally {
      setIsFetchingProof(false);
    }
  };

  const isLoading = isFetchingProof || isPending || isConfirming;

  return (
    <div className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
          <Image
            src={toGatewayURL(record.template.imageUrl)}
            alt={record.template.title}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold">{record.template.title}</h3>
          <p className="text-sm text-muted-foreground">
            Diterbitkan oleh: {record.template.creator.name}
          </p>
        </div>
      </div>
      <Button
        onClick={handleClaim}
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isConfirming
          ? "Menunggu Konfirmasi..."
          : isPending
          ? "Buka Dompet..."
          : "Klaim Sekarang"}
      </Button>
    </div>
  );
}
