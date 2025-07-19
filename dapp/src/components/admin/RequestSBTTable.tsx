"use client";

import { useState, useTransition } from "react";
import type { Institution, SbtMint } from "@prisma/client"; // Memastikan SbtMint diimpor
import { toast } from "sonner";

// Tipe gabungan dari kode Anda
export type SbtMintWithInstitution = SbtMint & {
  institution: Institution;
};

// PERBAIKAN: Mendefinisikan tipe yang spesifik untuk status
type SbtStatus = "PENDING" | "APPROVED" | "CLAIMED";

// Shadcn UI & Lucide Icons
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CheckCircle,
  Clock,
  FileJson,
  Wallet,
  ExternalLink,
  FileCheck,
} from "lucide-react";

// Komponen internal untuk menampilkan status dengan lebih visual
const StatusBadge = ({ status }: { status: SbtStatus }) => {
  const statusConfig = {
    PENDING: {
      text: "Menunggu Persetujuan",
      icon: Clock,
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    APPROVED: {
      text: "Telah Disetujui",
      icon: CheckCircle,
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    CLAIMED: {
      text: "Sudah Diklaim",
      icon: FileCheck,
      className: "bg-green-100 text-green-800 border-green-200",
    },
  };
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-2 ${config.className}`}>
      <Icon className="h-3 w-3" />
      <span>{config.text}</span>
    </Badge>
  );
};

// Komponen utama untuk setiap kartu permintaan
function ApprovalCard({
  request,
  onApprove,
}: {
  request: SbtMintWithInstitution;
  onApprove: (req: SbtMintWithInstitution, uri: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [uri, setUri] = useState(request.uri || "");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApproveClick = () => {
    if (!uri.trim()) {
      toast.error("Metadata URI tidak boleh kosong.");
      return;
    }
    startTransition(() => {
      onApprove(request, uri);
      setIsModalOpen(false);
    });
  };

  const explorerUrl = `https://sepolia.basescan.org/address/${request.institution.walletAddress}`;

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-lg text-primary">
              {request.institution.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono hover:underline"
              >
                {request.institution.walletAddress}
              </a>
              <ExternalLink className="h-3 w-3" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileJson className="h-4 w-4" />
              {request.uri ? (
                <a
                  href={request.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:underline"
                >
                  {request.uri}
                </a>
              ) : (
                <span className="italic">URI belum ditentukan</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end justify-between gap-4">
            {/* PERBAIKAN: Mengganti 'as any' dengan tipe SbtStatus yang lebih spesifik */}
            <StatusBadge status={request.status as SbtStatus} />
            {request.status === "PENDING" && (
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button>Setujui Permintaan</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Konfirmasi Persetujuan SBT</DialogTitle>
                    <DialogDescription>
                      Masukkan Metadata URI (IPFS CID) untuk institusi ini.
                      Tindakan ini akan mengirim transaksi on-chain.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="uri" className="text-right">
                        URI
                      </Label>
                      <Input
                        id="uri"
                        value={uri}
                        onChange={(e) => setUri(e.target.value)}
                        className="col-span-3"
                        placeholder="ipfs://..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button onClick={handleApproveClick} disabled={isPending}>
                      {isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Konfirmasi & Setujui
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RequestSBTTable({
  requests,
  onApprove,
}: {
  requests: SbtMintWithInstitution[];
  onApprove: (req: SbtMintWithInstitution, uri: string) => void;
}) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 px-6 border-2 border-dashed rounded-xl">
        <FileJson className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-gray-800">
          Tidak Ada Permintaan
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Saat ini tidak ada permintaan mint SBT yang menunggu untuk diproses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <ApprovalCard key={req.id} request={req} onApprove={onApprove} />
      ))}
    </div>
  );
}
