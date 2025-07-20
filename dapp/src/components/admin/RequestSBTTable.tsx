"use client";

import type { Institution, SbtMint } from "@prisma/client";

// Tipe gabungan untuk melewatkan data institusi bersama permintaan SBT
export type SbtMintWithInstitution = SbtMint & {
  institution: Institution;
};

// Tipe spesifik untuk status agar lebih aman
type SbtStatus = "PENDING" | "APPROVED" | "CLAIMED" | "REJECTED";

// Impor komponen UI dari Shadcn
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle,
  Clock,
  FileJson,
  Wallet,
  ExternalLink,
  FileCheck,
  Rocket,
} from "lucide-react";

// Komponen internal untuk menampilkan status dengan lebih visual.
// Komponen ini sudah bagus dan tidak perlu diubah.
const StatusBadge = ({ status }: { status: SbtStatus }) => {
  const statusConfig = {
    PENDING: {
      text: "Menunggu",
      icon: Clock,
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    APPROVED: {
      text: "Disetujui",
      icon: CheckCircle,
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    CLAIMED: {
      text: "Diklaim",
      icon: FileCheck,
      className: "bg-green-100 text-green-800 border-green-200",
    },
    REJECTED: {
      text: "Ditolak",
      icon: Clock,
      className: "bg-red-100 text-red-800 border-red-200",
    }, // Menambahkan status REJECTED
  };
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`gap-2 font-semibold ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      <span>{config.text}</span>
    </Badge>
  );
};

// Komponen kartu untuk setiap permintaan, sekarang dengan logika yang disederhanakan.
function ApprovalCard({
  request,
  onApprove,
  isProcessing,
}: {
  request: SbtMintWithInstitution;
  onApprove: (req: SbtMintWithInstitution) => void;
  isProcessing?: boolean;
}) {
  // Fungsi handle klik sekarang menjadi sangat sederhana.
  // Ia hanya meneruskan permintaan ke fungsi onApprove dari parent.
  const handleApproveClick = () => {
    onApprove(request);
  };

  const explorerUrl = `https://sepolia.basescan.org/address/${request.institution.walletAddress}`;

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {/* Bagian Informasi Institusi */}
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-lg text-gray-800">
              {request.institution.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4 flex-shrink-0" />
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono hover:underline truncate"
                title={request.institution.walletAddress}
              >
                {request.institution.walletAddress}
              </a>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileJson className="h-4 w-4 flex-shrink-0" />
              {request.uri ? (
                <a
                  href={request.uri.replace("ipfs://", "https://ipfs.io/ipfs/")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:underline"
                  title={request.uri}
                >
                  {request.uri}
                </a>
              ) : (
                <span className="italic">URI akan dibuat otomatis</span>
              )}
            </div>
          </div>

          {/* Bagian Status dan Tombol Aksi */}
          <div className="flex flex-col items-start sm:items-end justify-between gap-4">
            <StatusBadge status={request.status as SbtStatus} />

            {/* Tombol "Setujui" hanya muncul jika status masih PENDING */}
            {request.status === "PENDING" && (
              // REFACTOR: Dialog dan input URI dihapus total.
              // Sekarang hanya ada satu tombol sederhana.
              <Button onClick={handleApproveClick} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4" />
                    Setujui & Terbitkan
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Komponen utama yang diekspor.
// Fungsinya adalah sebagai "container" untuk menampilkan daftar kartu.
export default function RequestSBTTable({
  requests,
  onApprove,
  isProcessing,
}: {
  requests: SbtMintWithInstitution[];
  onApprove: (req: SbtMintWithInstitution) => void;
  isProcessing?: boolean;
}) {
  // Tampilan jika tidak ada permintaan. Ini sudah bagus.
  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-12 px-6 border-2 border-dashed rounded-xl bg-gray-50">
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

  // Render daftar kartu permintaan.
  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <ApprovalCard
          key={req.id}
          request={req}
          onApprove={onApprove}
          isProcessing={isProcessing} // Teruskan status loading ke setiap kartu
        />
      ))}
    </div>
  );
}
