"use client";

import { useState } from "react";
import type { Institution } from "@prisma/client";
// UI Components
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";

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
  requests: Institution[];
  onRegister: (institution: Institution) => Promise<void>;
}

const typeMap: Record<number, string> = {
  1: "Universitas",
  2: "Sekolah",
  3: "Perusahaan",
  4: "Organisasi",
  5: "Lainnya",
};

// Komponen baru untuk setiap item permintaan, sekarang dalam bentuk kartu yang bisa diperluas
function RequestItemCard({
  request,
  onRegister,
}: {
  request: Institution;
  onRegister: (req: Institution) => Promise<void>;
}) {
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleRegisterClick = async () => {
    setIsPending(true);
    try {
      await onRegister(request);
      toast.success(`Institusi "${request.name}" berhasil didaftarkan.`);
    } catch {
      toast.error("Gagal mendaftarkan institusi.");
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
      {/* Bagian yang selalu terlihat (Collapsed View) */}
      <div className="flex items-center p-4">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
          <div className="font-semibold text-primary">{request.name}</div>
          <div className="hidden md:block text-sm text-muted-foreground">
            {request.contactEmail}
          </div>
          <div className="hidden md:block text-sm text-muted-foreground">
            {typeMap[request.institutionType] ?? "Tidak Dikenal"}
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

      {/* Bagian detail yang bisa diperluas (Expanded View) */}
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
                <p className="font-semibold">Website</p>
                <a
                  href={`https://${request.officialWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-muted-foreground"
                >
                  {request.officialWebsite}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-semibold">Tanggal Permintaan</p>
                <p className="text-muted-foreground">
                  {new Date(request.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-semibold">Jenis Institusi</p>
                <p className="text-muted-foreground">
                  {typeMap[request.institutionType] ?? "Tidak Dikenal"}
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

export default function RequestTable({ requests, onRegister }: Props) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 px-6 border-2 border-dashed rounded-xl">
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
