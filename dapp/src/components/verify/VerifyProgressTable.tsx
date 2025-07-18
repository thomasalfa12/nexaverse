"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Loader2, FileText, UserCheck, Award, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- PERBAIKAN: Mengembalikan impor asli dari file server Anda ---
import { getVerifyStatus, VerifyStatus } from "@/lib/server/verify";

// Komponen-komponen ini diimpor seperti sebelumnya.
import RegisterForm from "./RegisterForm";
import { RequestMintForm } from "./RequestMintForm";
import { ClaimSBTButton } from "./ClaimSBTButton";

// Komponen UI dari shadcn, tidak perlu diubah.
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

// ========================================================================
// VERSI BARU DARI KOMPONEN INTERNAL ANDA (HANYA PERUBAHAN VISUAL)
// ========================================================================

// Modifikasi pada 'Row' untuk menjadi 'TimelineRow' yang lebih visual
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
    : "text-gray-400";
  const ringColor = done
    ? "ring-green-500"
    : isActive
    ? "ring-blue-500"
    : "ring-gray-300";

  return (
    <TableRow className="border-b-0 hover:bg-transparent">
      {/* Kolom Ikon dan Garis Timeline */}
      <TableCell className="w-16 align-top pt-5 pr-0">
        <div className="flex flex-col items-center h-full">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center bg-white ring-2 ${ringColor} z-10`}
          >
            <Icon className={`h-5 w-5 ${statusColor}`} />
          </div>
          {/* Garis vertikal */}
          <div className="w-0.5 flex-grow bg-gray-200 mt-1"></div>
        </div>
      </TableCell>

      {/* Kolom Judul dan Status */}
      <TableCell className="align-top pt-5 pl-4">
        <h3
          className={`font-bold text-lg ${
            done || isActive ? "text-gray-800" : "text-gray-500"
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

// StatusBox tetap sama, mungkin dengan sedikit penyesuaian gaya
function StatusBox({ text, success }: { text: string; success?: boolean }) {
  const variant = success ? "success" : "default";
  return (
    <Alert
      variant={variant}
      className={`${
        success
          ? "bg-green-50 border-green-500 text-green-800"
          : "bg-blue-50 border-blue-500 text-blue-800"
      }`}
    >
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  );
}

// ========================================================================
// KOMPONEN UTAMA DENGAN LOGIKA ASLI ANDA, HANYA JSX YANG DISESUAIKAN
// ========================================================================

export default function VerifyProgressTable() {
  const [status, setStatus] = useState<VerifyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();

  // --- LOGIKA FETCHING DATA ANDA - TIDAK DIUBAH SAMA SEKALI ---
  useEffect(() => {
    if (!address) {
      setLoading(false); // Pastikan loading berhenti jika tidak ada address
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

  // Tampilan Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Tampilan jika wallet tidak terhubung
  if (!address) {
    return (
      <div className="p-6 text-center border-2 border-dashed rounded-lg text-gray-500">
        Silakan hubungkan wallet Anda untuk memulai proses verifikasi.
      </div>
    );
  }

  // Tampilan jika data status gagal diambil (penting untuk UX)
  if (!status) {
    return (
      <div className="p-6 text-center border-2 border-dashed rounded-lg text-red-500">
        Gagal memuat status verifikasi. Silakan coba lagi.
      </div>
    );
  }

  // --- STRUKTUR RENDER DENGAN LOGIKA ASLI ANDA ---
  return (
    <Card className="p-0 sm:p-4 bg-white shadow-xl shadow-gray-200/50 rounded-2xl">
      <Table className="border-separate border-spacing-0">
        {/* Header sengaja disembunyikan untuk tampilan timeline */}
        <TableHeader className="hidden">
          <TableRow>
            <TableHead>Langkah</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* --- BLOK LOGIKA 1: REGISTER --- (Tidak diubah) */}
          <TimelineRow
            step="1. Register Institusi"
            icon={Building}
            done={status.registered}
            isActive={!status.registered}
          />
          {!status.registered && (
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableCell className="w-16 pr-0">
                <div className="w-0.5 h-full bg-gray-200 mx-auto"></div>
              </TableCell>
              <TableCell className="pb-8 pl-4">
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <RegisterForm onSuccess={() => location.reload()} />
                  </motion.div>
                </AnimatePresence>
              </TableCell>
            </TableRow>
          )}

          {/* --- BLOK LOGIKA 2: REQUEST MINT --- (Tidak diubah) */}
          <TimelineRow
            step="2. Request Mint SBT"
            icon={FileText}
            done={status.requested}
            isActive={status.registered && !status.requested}
          />
          {status.registered && !status.requested && (
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableCell className="w-16 pr-0">
                <div className="w-0.5 h-full bg-gray-200 mx-auto"></div>
              </TableCell>
              <TableCell className="pb-8 pl-4">
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <RequestMintForm onSuccess={() => location.reload()} />
                  </motion.div>
                </AnimatePresence>
              </TableCell>
            </TableRow>
          )}

          {/* --- BLOK LOGIKA 3: PERSETUJUAN --- (Tidak diubah) */}
          <TimelineRow
            step="3. Persetujuan Admin"
            icon={UserCheck}
            done={status.approved}
            isActive={status.requested && !status.approved}
          />
          {status.requested && !status.approved && (
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableCell className="w-16 pr-0">
                <div className="w-0.5 h-full bg-gray-200 mx-auto"></div>
              </TableCell>
              <TableCell className="pb-8 pl-4">
                <StatusBox text="Menunggu persetujuan dari admin..." />
              </TableCell>
            </TableRow>
          )}

          {/* --- BLOK LOGIKA 4: KLAIM TOKEN --- (Tidak diubah) */}
          <TimelineRow
            step="4. Klaim Token"
            icon={Award}
            done={status.claimed}
            isActive={status.approved && !status.claimed}
          />
          {status.approved && (
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableCell className="w-16 pr-0">
                <div className="w-0.5 h-full bg-gray-200 mx-auto"></div>
              </TableCell>
              <TableCell className="pb-8 pl-4">
                {!status.claimed ? (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <ClaimSBTButton onSuccess={() => location.reload()} />
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
