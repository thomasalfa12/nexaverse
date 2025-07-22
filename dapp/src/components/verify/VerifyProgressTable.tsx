"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Loader2, FileText, UserCheck, Award, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getVerifyStatus, VerifyStatus } from "@/lib/server/verify";
import RegisterForm from "./RegisterForm";
import { RequestMintForm } from "./RequestMintForm";
import { ClaimSBTButton } from "./ClaimSBTPreview";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

function TimelineRow({
  step,
  icon: Icon,
  done,
  isActive,
}: {
  step: string;
  icon: React.ElementType;
  done?: boolean;
  isActive?: boolean;
}) {
  const statusColor = done
    ? "text-green-500"
    : isActive
    ? "text-blue-500"
    : "text-gray-400 dark:text-gray-500";
  const ringColor = done
    ? "ring-green-500"
    : isActive
    ? "ring-blue-500"
    : "ring-border";

  return (
    <TableRow className="border-b-0 hover:bg-transparent">
      <TableCell className="w-16 align-top pt-5 pr-0">
        <div className="flex flex-col items-center h-full">
          {/* PERBAIKAN: Mengganti bg-white dengan bg-background agar sesuai tema */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center bg-background ring-2 ${ringColor} z-10`}
          >
            <Icon className={`h-5 w-5 ${statusColor}`} />
          </div>
          {/* PERBAIKAN: Mengganti bg-gray-200 dengan bg-border */}
          <div className="w-0.5 flex-grow bg-border mt-1"></div>
        </div>
      </TableCell>
      <TableCell className="align-top pt-5 pl-4">
        {/* PERBAIKAN: Menggunakan text-foreground dan text-muted-foreground */}
        <h3
          className={`font-bold text-lg ${
            done || isActive ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {step}
        </h3>
        <div className={`mt-1 text-sm font-semibold ${statusColor}`}>
          {done ? "Selesai" : isActive ? "Langkah Saat Ini" : "Menunggu"}
        </div>
      </TableCell>
    </TableRow>
  );
}

function StatusBox({ text, success }: { text: string; success?: boolean }) {
  // Komponen Alert dari shadcn sudah cukup theme-aware, tidak perlu diubah.
  return (
    <Alert variant={success ? "success" : "default"}>
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  );
}

export default function VerifyProgressTable() {
  const [status, setStatus] = useState<VerifyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const res = await getVerifyStatus(address);
        setStatus(res);
      } catch (err) {
        console.error("Gagal fetch status:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [address]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!address) {
    return (
      <div className="p-6 text-center border-2 border-dashed rounded-lg text-muted-foreground">
        Silakan hubungkan wallet Anda untuk memulai proses verifikasi.
      </div>
    );
  }
  if (!status) {
    return (
      <div className="p-6 text-center border-2 border-dashed rounded-lg text-destructive">
        Gagal memuat status verifikasi. Silakan coba lagi.
      </div>
    );
  }

  return (
    // PERBAIKAN: Menghapus bg-white dan shadow hardcoded, biarkan Card default yang bekerja
    <Card className="p-0 sm:p-4">
      <Table className="border-separate border-spacing-0">
        <TableHeader className="hidden">
          <TableRow>
            <TableHead>Langkah</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TimelineRow
            step="1. Register Institusi"
            icon={Building}
            done={status.registered}
            isActive={!status.registered}
          />
          {!status.registered && (
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableCell className="w-16 pr-0">
                <div className="w-0.5 h-full bg-border mx-auto"></div>
              </TableCell>
              <TableCell className="pb-8 pl-4">
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <RegisterForm onSuccess={() => window.location.reload()} />
                  </motion.div>
                </AnimatePresence>
              </TableCell>
            </TableRow>
          )}

          <TimelineRow
            step="2. Request Mint SBT"
            icon={FileText}
            done={status.requested}
            isActive={status.registered && !status.requested}
          />
          {status.registered && !status.requested && (
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableCell className="w-16 pr-0">
                <div className="w-0.5 h-full bg-border mx-auto"></div>
              </TableCell>
              <TableCell className="pb-8 pl-4">
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <RequestMintForm
                      onSuccess={() => window.location.reload()}
                    />
                  </motion.div>
                </AnimatePresence>
              </TableCell>
            </TableRow>
          )}

          <TimelineRow
            step="3. Persetujuan Admin"
            icon={UserCheck}
            done={status.approved}
            isActive={status.requested && !status.approved}
          />
          {status.requested && !status.approved && (
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableCell className="w-16 pr-0">
                <div className="w-0.5 h-full bg-border mx-auto"></div>
              </TableCell>
              <TableCell className="pb-8 pl-4">
                <StatusBox text="Menunggu persetujuan dari admin..." />
              </TableCell>
            </TableRow>
          )}

          <TimelineRow
            step="4. Klaim Token"
            icon={Award}
            done={status.claimed}
            isActive={status.approved && !status.claimed}
          />
          {status.approved && (
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableCell className="w-16 pr-0">
                <div className="w-0.5 h-full bg-border mx-auto"></div>
              </TableCell>
              <TableCell className="pb-8 pl-4">
                {!status.claimed ? (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <ClaimSBTButton
                        onSuccess={() => window.location.reload()}
                        sbtUri={status.sbtCid}
                      />
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <StatusBox text="Token berhasil diklaim 🎉" success />
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
