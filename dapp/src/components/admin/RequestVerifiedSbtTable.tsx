"use client";

import type { VerifiedEntity, VerifiedSbtClaimProcess } from "@prisma/client";
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

export type SbtApprovalRequest = VerifiedSbtClaimProcess & {
  entity: VerifiedEntity;
};

type SbtClaimStatus = "NOT_REQUESTED" | "REQUESTED" | "APPROVED" | "CLAIMED";

const StatusBadge = ({ status }: { status: SbtClaimStatus }) => {
  // PERBAIKAN: Menggunakan warna dasar dari tema untuk status default
  const statusConfig = {
    NOT_REQUESTED: {
      text: "Belum Diminta",
      icon: Clock,
      className: "bg-secondary text-secondary-foreground border-border",
    },
    REQUESTED: {
      text: "Menunggu",
      icon: Clock,
      className:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/30",
    },
    APPROVED: {
      text: "Disetujui",
      icon: CheckCircle,
      className:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
    },
    CLAIMED: {
      text: "Diklaim",
      icon: FileCheck,
      className:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-500/30",
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
            {/* PERBAIKAN: Mengganti text-gray-800 dengan text-foreground */}
            <h3 className="font-bold text-lg text-foreground">
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
      // PERBAIKAN: Mengganti warna hardcoded dengan variabel tema
      <div className="text-center py-12 px-6 border-2 border-dashed rounded-xl bg-card">
        <FileJson className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-semibold text-foreground">
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
