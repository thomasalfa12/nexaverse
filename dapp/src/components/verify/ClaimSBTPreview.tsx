"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { motion, AnimatePresence } from "framer-motion";

// Konteks & Komponen UI
import { contracts } from "@/lib/contracts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  PartyPopper,
  ExternalLink,
  ShieldCheck,
  ImageOff,
  CheckCircle,
} from "lucide-react";

type SbtMetadata = { name: string; description: string; image: string };

// IPFS Gateway fallback list
const IPFS_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://dweb.link/ipfs/",
];

const InitialClaimView = ({
  metadata,
  isLoading,
  onClaim,
}: {
  metadata: SbtMetadata | null;
  isLoading: boolean;
  onClaim: () => void;
}) => (
  <motion.div
    key="initial"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="space-y-6"
  >
    <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center shadow-inner relative">
      {isLoading ? (
        <Skeleton className="w-full h-full" />
      ) : metadata?.image ? (
        <Image
          src={metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
          alt="SBT Preview"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          onError={() => {
            // Fallback jika gambar gagal load
            console.warn("Image failed to load, showing placeholder");
          }}
        />
      ) : (
        <ImageOff className="h-16 w-16 text-gray-400" />
      )}
    </div>

    <div className="text-center space-y-2">
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full mx-auto" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
        </>
      ) : metadata ? (
        <>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {metadata.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {metadata.description}
          </p>
        </>
      ) : (
        <p className="text-gray-500">Metadata tidak tersedia.</p>
      )}
    </div>

    <div className="pt-2">
      <Button
        onClick={onClaim}
        disabled={isLoading || !metadata}
        className="w-full text-lg py-7 font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
        size="lg"
      >
        <ShieldCheck className="w-6 h-6 mr-2" />
        Klaim SBT Anda
      </Button>
    </div>
  </motion.div>
);

const ProcessTrackerView = ({
  isConfirming,
  isSyncing,
}: {
  isConfirming: boolean;
  isSyncing: boolean;
}) => {
  const steps = [
    {
      name: "Konfirmasi Blockchain",
      active: isConfirming,
      done: !isConfirming,
    },
    {
      name: "Sinkronisasi Status",
      active: !isConfirming && isSyncing,
      done: !isConfirming && !isSyncing,
    },
  ];
  return (
    <motion.div
      key="processing"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center space-y-8 h-[500px]"
    >
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Memproses Klaim Anda...
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-400">
        Harap tunggu, kami sedang mengamankan SBT Anda di blockchain dan
        memperbarui data.
      </p>
      <div className="w-full max-w-xs space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-4">
            <div
              className={`flex items-center justify-center h-10 w-10 rounded-full border-2 ${
                step.done ? "bg-green-500 border-green-500" : "border-primary"
              }`}
            >
              {step.done ? (
                <CheckCircle className="h-6 w-6 text-white" />
              ) : (
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              )}
            </div>
            <span
              className={`font-semibold ${
                step.done
                  ? "text-gray-500 dark:text-gray-400 line-through"
                  : "text-primary"
              }`}
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const ClaimSuccessView = ({
  hash,
  metadata,
}: {
  hash: `0x${string}`;
  metadata: SbtMetadata | null;
}) => {
  const explorerUrl = `https://sepolia.basescan.org/tx/${hash}`;
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="space-y-6"
    >
      <div className="text-center">
        <PartyPopper className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Klaim Berhasil!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          SBT Anda telah aman di dalam wallet.
        </p>
      </div>
      <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center shadow-inner relative group">
        {metadata?.image ? (
          <Image
            src={metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
            alt="SBT Badge"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <ImageOff className="h-16 w-16 text-gray-400" />
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white font-semibold bg-white/10 p-3 rounded-lg backdrop-blur-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Lihat Transaksi
          </a>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// --- FUNGSI HELPER UNTUK FETCH METADATA DENGAN RETRY ---
// ============================================================================
async function fetchMetadataWithRetry(sbtUri: string): Promise<SbtMetadata> {
  const cid = sbtUri.replace("ipfs://", "");
  let lastError: Error | null = null;

  // Coba dengan beberapa gateway IPFS
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = `${gateway}${cid}`;
      console.log(`Trying to fetch metadata from: ${url}`);

      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000), // 10 detik timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: SbtMetadata = await response.json();

      // Validasi data
      if (!data.name || !data.description) {
        throw new Error("Metadata tidak lengkap");
      }

      console.log(`Successfully fetched metadata from: ${url}`);
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Failed to fetch from ${gateway}: ${lastError.message}`);
      continue;
    }
  }

  // Jika semua gateway gagal
  throw new Error(
    `Gagal mengambil metadata dari semua gateway IPFS. Last error: ${
      lastError?.message || "Unknown error"
    }`
  );
}

// ============================================================================
// --- KOMPONEN UTAMA (STATE MACHINE) ---
// ============================================================================
export function ClaimSBTButton({
  onSuccess,
  sbtUri,
}: {
  onSuccess?: () => void;
  sbtUri?: string | null;
}) {
  const { address } = useAccount();
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined);
  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProcessComplete, setIsProcessComplete] = useState(false);
  const [isSubmitting, startTransition] = useTransition();
  const [metadata, setMetadata] = useState<SbtMetadata | null>(null);
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);

  useEffect(() => {
    if (sbtUri) {
      const fetchMetadata = async () => {
        setIsMetadataLoading(true);
        try {
          const data = await fetchMetadataWithRetry(sbtUri);
          setMetadata(data);
        } catch (error) {
          console.error("Fetch metadata error:", error);

          // Set fallback metadata jika fetch gagal
          setMetadata({
            name: "Nexaverse Verified Entity",
            description:
              "This Soulbound Token certifies that this entity has been officially verified by the Nexaverse platform.",
            image: "", // Empty image akan menampilkan placeholder
          });

          toast.error("Gagal memuat pratinjau SBT, menggunakan data default.");
        } finally {
          setIsMetadataLoading(false);
        }
      };
      fetchMetadata();
    } else {
      setIsMetadataLoading(false);
    }
  }, [sbtUri]);

  async function handleClaim() {
    if (!address) {
      toast.error("Wallet belum terhubung.");
      return;
    }
    startTransition(async () => {
      try {
        const txHash = await writeContractAsync({
          address: contracts.verified.address,
          abi: contracts.verified.abi,
          functionName: "claim",
          args: [],
        });
        setHash(txHash);
      } catch (err) {
        console.error(err);
        toast.error("Transaksi klaim gagal atau dibatalkan.");
      }
    });
  }

  useEffect(() => {
    if (isConfirmed && hash && address && !isSyncing && !isProcessComplete) {
      const finalizeClaim = async () => {
        setIsSyncing(true);
        try {
          toast.info("Sinkronisasi status ke database...");
          const res = await fetch("/api/user/finalize-claim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, txHash: hash }),
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(
              errorData.error || "Gagal memperbarui status di database."
            );
          }
          toast.success("Status berhasil disinkronkan!");
          setIsProcessComplete(true);
          if (onSuccess) {
            setTimeout(() => onSuccess(), 3000);
          }
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Gagal sinkronisasi.";
          toast.error(errorMessage);
          console.error("Finalize claim error:", err);
        } finally {
          setIsSyncing(false);
        }
      };
      finalizeClaim();
    }
  }, [isConfirmed, hash, address, isSyncing, onSuccess, isProcessComplete]);

  return (
    <div className="w-full max-w-md mx-auto bg-card rounded-2xl border shadow-lg p-6 sm:p-8">
      <AnimatePresence mode="wait">
        {isProcessComplete && hash ? (
          <ClaimSuccessView hash={hash} metadata={metadata} />
        ) : isSubmitting || isConfirming || isSyncing ? (
          <ProcessTrackerView
            isConfirming={isConfirming}
            isSyncing={isSyncing}
          />
        ) : (
          <InitialClaimView
            metadata={metadata}
            isLoading={isMetadataLoading}
            onClaim={handleClaim}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
