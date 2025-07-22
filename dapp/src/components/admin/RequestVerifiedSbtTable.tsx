// File: src/components/admin/RequestVerifiedSbtTable.tsx

"use client";

// SINKRONISASI: Mengimpor tipe yang benar dari Prisma
import type { VerifiedEntity, VerifiedSbtClaimProcess } from "@prisma/client";

// Tipe gabungan yang akan diterima oleh komponen ini dari AdminPage
export type SbtApprovalRequest = VerifiedSbtClaimProcess & {
  entity: VerifiedEntity;
};

// Tipe spesifik untuk status agar lebih aman
type SbtClaimStatus = "NOT_REQUESTED" | "REQUESTED" | "APPROVED" | "CLAIMED";

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
const StatusBadge = ({ status }: { status: SbtClaimStatus }) => {
  const statusConfig = {
    NOT_REQUESTED: {
      text: "Belum Diminta",
      icon: Clock,
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
    REQUESTED: {
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
  };
  const config = statusConfig[status] || statusConfig.REQUESTED;
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

// Komponen kartu untuk setiap permintaan
function ApprovalCard({
  request,
  onApprove,
  isProcessing,
}: {
  request: SbtApprovalRequest;
  onApprove: (req: SbtApprovalRequest) => void;
  isProcessing?: boolean;
}) {
  const handleApproveClick = () => {
    onApprove(request);
  };

  const explorerUrl = `https://sepolia.basescan.org/address/${request.entity.walletAddress}`;

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-lg text-gray-800">
              {request.entity.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4 flex-shrink-0" />
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono hover:underline truncate"
                title={request.entity.walletAddress}
              >
                {request.entity.walletAddress}
              </a>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileJson className="h-4 w-4 flex-shrink-0" />
              {request.cid ? (
                <a
                  href={
                    request.cid.startsWith("ipfs://")
                      ? request.cid.replace("ipfs://", "https://ipfs.io/ipfs/")
                      : `https://ipfs.io/ipfs/${request.cid}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:underline"
                  title={request.cid}
                >
                  {request.cid}
                </a>
              ) : (
                <span className="italic">URI akan dibuat otomatis</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end justify-between gap-4">
            <StatusBadge status={request.status as SbtClaimStatus} />
            {request.status === "REQUESTED" && (
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

// Komponen utama yang diekspor
export default function RequestVerifiedSbtTable({
  requests,
  onApprove,
  isProcessing,
}: {
  requests: SbtApprovalRequest[];
  onApprove: (req: SbtApprovalRequest) => void;
  isProcessing?: boolean;
}) {
  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-12 px-6 border-2 border-dashed rounded-xl bg-gray-50">
        <FileJson className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-gray-800">
          Tidak Ada Permintaan
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Saat ini tidak ada permintaan lencana yang menunggu untuk diproses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <ApprovalCard
          key={req.id}
          request={req}
          onApprove={onApprove}
          isProcessing={isProcessing}
        />
      ))}
    </div>
  );
}
