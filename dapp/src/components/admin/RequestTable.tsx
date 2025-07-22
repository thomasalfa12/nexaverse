"use client";

import { useState } from "react";
import type { VerifiedEntity } from "@prisma/client";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Icons
import {
  Loader2,
  ChevronDown,
  Building,
  Mail,
  Globe,
  Wallet,
  Calendar,
  Copy,
  Inbox,
} from "lucide-react";

interface Props {
  requests: VerifiedEntity[];
  onRegister: (verified: VerifiedEntity) => Promise<void>;
}

// SINKRONISASI: typeMap ini sekarang selaras dengan enum `EntityType` di ISBTRegistry.sol
const typeMap: Record<number, string> = {
  1: "Institusi", // Universitas, Sekolah, Perusahaan
  2: "Kreator", // Individu, Pengajar
  3: "Komunitas", // Guild, Grup Online
  4: "DAO",
};

// Komponen untuk setiap item permintaan dalam bentuk kartu
function RequestItemCard({
  request,
  onRegister,
}: {
  request: VerifiedEntity;
  onRegister: (req: VerifiedEntity) => Promise<void>;
}) {
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleRegisterClick = async () => {
    setIsPending(true);
    try {
      await onRegister(request);
      // Pesan sukses tidak lagi dibutuhkan di sini karena sudah ditangani di parent (AdminPage)
    } catch {
      // Error juga sudah ditangani di parent
    } finally {
      setIsPending(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Disalin ke clipboard!");
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-card border rounded-xl shadow-sm transition-all hover:shadow-md"
    >
      {/* Bagian yang selalu terlihat */}
      <div className="flex items-center p-4">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
          <div className="font-semibold text-primary">{request.name}</div>
          <div
            className="hidden md:block text-sm text-muted-foreground truncate"
            title={request.contactEmail}
          >
            {request.contactEmail}
          </div>
          <div className="hidden md:block text-sm text-muted-foreground">
            {/* SINKRONISASI: Menggunakan `entityType` sesuai skema final */}
            {typeMap[request.entityType] ?? "Tidak Dikenal"}
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            {request.walletAddress.slice(0, 6)}...
            {request.walletAddress.slice(-4)}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button size="sm" disabled={isPending} onClick={handleRegisterClick}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Daftarkan"
            )}
          </Button>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      {/* Bagian detail yang bisa diperluas */}
      <CollapsibleContent>
        <div className="border-t bg-muted/30 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-semibold">Email Kontak</p>
                <p className="text-muted-foreground">{request.contactEmail}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-semibold">Primary URL</p>
                {/* SINKRONISASI: Menggunakan `primaryUrl` sesuai skema final */}
                <a
                  href={`https://${request.primaryUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {request.primaryUrl}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-semibold">Tanggal Permintaan</p>
                <p className="text-muted-foreground">
                  {/* SINKRONISASI: Menambahkan pengecekan null untuk `registrationDate` */}
                  {request.registeredAt
                    ? new Date(request.registeredAt).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-semibold">Jenis Entitas</p>
                <p className="text-muted-foreground">
                  {/* SINKRONISASI: Menggunakan `entityType` sesuai skema final */}
                  {typeMap[request.entityType] ?? "Tidak Dikenal"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:col-span-2">
              <Wallet className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-semibold">Alamat Wallet</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs text-muted-foreground">
                    {request.walletAddress}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(request.walletAddress)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Komponen utama yang diekspor
export default function RequestTable({ requests, onRegister }: Props) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 px-6 border-2 border-dashed rounded-xl bg-gray-50">
        <Inbox className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-gray-800">
          Kotak Masuk Kosong
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tidak ada permintaan pendaftaran baru saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <RequestItemCard key={req.id} request={req} onRegister={onRegister} />
      ))}
    </div>
  );
}
