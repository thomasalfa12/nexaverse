// File: app/dashboard/page.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import type { CredentialTemplate, VerifiedEntity } from "@prisma/client";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toast } from "sonner";
import { Loader2, Sparkles, Check, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
// Kita perlu ABI dari UserSBT untuk memanggil fungsi mint
import { abi as userSbtAbi } from "../../../public/artifacts/src/UserSBT.sol/UserSBT.json";

// Tipe data diperluas untuk data yang kita terima dari API
type TemplateForDiscovery = CredentialTemplate & {
  creator: VerifiedEntity;
  _count: {
    issuedCredentials: number;
  };
};

// Tipe untuk peta status kelayakan
type EligibilityMap = Record<string, "ELIGIBLE" | "CLAIMED">;

// Helper untuk menerjemahkan URI IPFS menjadi URL Gateway HTTPS
const toGatewayURL = (ipfsUri: string) => {
  if (ipfsUri && ipfsUri.startsWith("ipfs://")) {
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return ipfsUri;
};

// --- Komponen Kartu Kredensial dengan Logika Penuh ---
const CredentialCard = ({
  template,
  eligibilityStatus,
  onClaimSuccess,
}: {
  template: TemplateForDiscovery;
  eligibilityStatus?: "ELIGIBLE" | "CLAIMED";
  onClaimSuccess: (templateId: string) => void;
}) => {
  const { address } = useAccount();
  const [isSyncing, setIsSyncing] = useState(false);
  const { data: hash, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  const [isSubmitting, startTransition] = useTransition();

  const handleClaim = () => {
    if (!address) return toast.error("Wallet tidak terhubung.");

    startTransition(async () => {
      try {
        toast.info(`Memulai proses klaim untuk "${template.title}"...`);

        // TODO: Arsitektur Jangka Panjang:
        // Idealnya, sebelum mint, kita panggil Server Action yang membuat metadata JSON dinamis.
        // Untuk MVP, kita akan menggunakan placeholder URI dari gambar.
        const metadataUri = template.imageUrl;
        const expiryTimestamp = 0; // 0 untuk permanen

        await writeContractAsync({
          address: template.contractAddress as `0x${string}`,
          abi: userSbtAbi,
          functionName: "mint",
          args: [address, metadataUri, expiryTimestamp],
        });
      } catch (err) {
        console.error("Gagal mengirim transaksi klaim:", err);
        toast.error("Transaksi gagal atau dibatalkan.");
      }
    });
  };

  useEffect(() => {
    if (isConfirmed && hash && address && !isSyncing) {
      const finalize = async () => {
        setIsSyncing(true);
        try {
          const res = await fetch("/api/user/finalize-credential-claim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ templateId: template.id, txHash: hash }),
          });
          if (!res.ok)
            throw new Error("Gagal sinkronisasi status ke database.");

          toast.success("Kredensial berhasil diklaim dan disinkronkan!");
          onClaimSuccess(template.id);
        } catch (err: unknown) {
          const msg =
            err instanceof Error ? err.message : "Gagal sinkronisasi.";
          toast.error(msg);
        } finally {
          setIsSyncing(false);
        }
      };
      finalize();
    }
  }, [isConfirmed, hash, address, isSyncing, template.id, onClaimSuccess]);

  const isLoading = isSubmitting || isConfirming || isSyncing;

  return (
    <div className="border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
      <div className="aspect-[16/9] bg-muted overflow-hidden relative">
        <Image
          src={toGatewayURL(template.imageUrl)}
          alt={template.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold truncate">{template.title}</h3>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <span>Diterbitkan oleh:</span>
          <span className="font-semibold ml-1.5">{template.creator.name}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2 flex-grow">
          {template.description}
        </p>
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            {template._count.issuedCredentials} telah diterbitkan
          </div>
          {eligibilityStatus === "ELIGIBLE" && (
            <Button onClick={handleClaim} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isSubmitting
                ? "Menunggu..."
                : isConfirming
                ? "Mengkonfirmasi..."
                : isSyncing
                ? "Menyelesaikan..."
                : "Klaim Sekarang"}
            </Button>
          )}
          {eligibilityStatus === "CLAIMED" && (
            <Button variant="ghost" disabled className="text-green-600">
              <Check className="mr-2 h-4 w-4" />
              Sudah Diklaim
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Komponen Halaman Utama
export default function DiscoveryPage() {
  const { address, isConnected } = useAccount();
  const [templates, setTemplates] = useState<TemplateForDiscovery[]>([]);
  const [eligibilityMap, setEligibilityMap] = useState<EligibilityMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEligibility = async () => {
    if (isConnected && address) {
      try {
        const eligibilityRes = await fetch("/api/user/eligibility-status");
        if (!eligibilityRes.ok)
          throw new Error("Gagal memeriksa status kelayakan.");
        const eligibilityData = await eligibilityRes.json();
        setEligibilityMap(eligibilityData);
      } catch (err: unknown) {
        console.error("Gagal fetch kelayakan:", err);
      }
    } else {
      setEligibilityMap({});
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const templatesRes = await fetch("/api/discovery/templates");
        if (!templatesRes.ok)
          throw new Error(
            `Gagal memuat kredensial (status: ${templatesRes.status})`
          );
        const templatesData = await templatesRes.json();
        setTemplates(templatesData);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    fetchEligibility();
  }, [isConnected, address]);

  const handleClaimSuccess = (templateId: string) => {
    setEligibilityMap((prevMap) => ({
      ...prevMap,
      [templateId]: "CLAIMED",
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Discovery</h1>
        <p className="text-muted-foreground">
          Temukan dan klaim kredensial terverifikasi dari berbagai kreator di
          ekosistem Nexaverse.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-semibold">
                Terjadi Error
              </p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!isConnected && !error && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Hubungkan wallet Anda untuk melihat kredensial yang bisa Anda
                klaim.
              </p>
            </div>
          </div>
        </div>
      )}

      {!error &&
        (templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <CredentialCard
                key={template.id}
                template={template}
                eligibilityStatus={eligibilityMap[template.id]}
                onClaimSuccess={handleClaimSuccess}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6 border-2 border-dashed rounded-xl">
            <h3 className="text-lg font-semibold">Belum Ada Kredensial</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Saat ini belum ada kredensial yang tersedia. Cek kembali nanti!
            </p>
          </div>
        ))}
    </div>
  );
}
