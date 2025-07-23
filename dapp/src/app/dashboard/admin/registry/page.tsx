"use client";

import { useEffect, useState, useTransition } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { contracts } from "@/lib/contracts";
import AdminLayout from "@/components/admin/registry/AdminLayout";
import RequestTable from "@/components/admin/registry/RequestTable";
import VerifiedEntityTable from "@/components/admin/registry/VerifiedEntityTable"; // REKOMENDASI: Ganti nama komponen
import VerifiedEntityStats from "@/components/admin/registry/VerifiedEntityStats"; // REKOMENDASI: Ganti nama komponen
import RequestVerifiedSbtTable, {
  type SbtApprovalRequest, // Menggunakan tipe yang benar dari action
} from "@/components/admin/registry/RequestVerifiedSbtTable"; // REKOMENDASI: Ganti nama komponen
import type { VerifiedEntity } from "@prisma/client";
import { toast } from "sonner";
import { approveSbt } from "@/lib/server/actions/approveSbtAction"; // FIX: Path import yang benar
import { AlertTriangle, ShieldOff } from "lucide-react";
export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [isApproving, startApproveTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const { data: owner } = useReadContract({
    address: contracts.registry.address,
    abi: contracts.registry.abi,
    functionName: "owner",
  });

  const [pendingRequests, setPendingRequests] = useState<VerifiedEntity[]>([]);
  const [registeredList, setRegisteredList] = useState<VerifiedEntity[]>([]);
  const [sbtRequests, setSbtRequests] = useState<SbtApprovalRequest[]>([]);

  const isAdmin =
    typeof owner === "string" &&
    typeof address === "string" &&
    owner.toLowerCase() === address.toLowerCase();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (isConnected && isAdmin) {
        await Promise.all([fetchVerifiedEntities(), fetchSBTRequests()]);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [isConnected, isAdmin]);

  const fetchVerifiedEntities = async () => {
    try {
      const [resPending, resRegistered] = await Promise.all([
        fetch("/api/admin/registry/pending-request"), // REKOMENDASI: Buat endpoint terpisah
        fetch("/api/admin/registry/registered"),
      ]);
      const [pending, registered] = await Promise.all([
        resPending.json(),
        resRegistered.json(),
      ]);
      setPendingRequests(pending);
      setRegisteredList(registered);
    } catch (err) {
      console.error("[fetchVerifiedEntities]", err);
      toast.error("Gagal memuat data entitas.");
    }
  };

  const fetchSBTRequests = async () => {
    try {
      const res = await fetch("/api/admin/registry/sbt-requests");
      if (!res.ok) throw new Error("Gagal memuat permintaan SBT");
      const data: SbtApprovalRequest[] = await res.json();
      setSbtRequests(data);
    } catch (err) {
      console.error("[fetchSBTRequests]", err);
      toast.error("Gagal memuat permintaan SBT.");
    }
  };

  const handleRegister = async (entity: VerifiedEntity) => {
    if (!publicClient) {
      toast.error("Gagal terhubung ke provider blockchain.");
      return;
    }
    try {
      toast.info("Silakan konfirmasi transaksi di wallet Anda...");
      const txHash = await writeContractAsync({
        address: contracts.registry.address,
        abi: contracts.registry.abi,
        // SINKRONISASI: Menggunakan nama fungsi `registerEntity` yang benar
        functionName: "registerEntity",
        args: [
          entity.walletAddress as `0x${string}`,
          entity.name,
          entity.primaryUrl, // SINKRONISASI: Menggunakan `primaryUrl`
          entity.contactEmail,
          entity.entityType,
        ],
      });

      toast.loading("Transaksi dikirim, menunggu konfirmasi on-chain...", {
        id: "tx-receipt",
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      if (receipt.status === "reverted")
        throw new Error("Transaksi on-chain gagal (reverted).");

      toast.dismiss("tx-receipt");
      toast.success("Transaksi on-chain berhasil!");

      const res = await fetch("/api/admin/registry/finalize-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityId: entity.id, txHash }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui status di database.");

      toast.success("✅ Entitas berhasil terdaftar on-chain dan off-chain!");
      fetchVerifiedEntities();
    } catch (err: unknown) {
      toast.dismiss("tx-receipt");
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan tidak diketahui.";
      console.error("[handleRegister]", err);
      toast.error(errorMessage);
    }
  };

  const handleApprove = async (req: SbtApprovalRequest) => {
    startApproveTransition(async () => {
      const toastId = toast.loading("Memulai proses persetujuan otomatis...");
      const result = await approveSbt(req);
      if (result.success) {
        toast.success("✅ Proses persetujuan selesai dan tersinkronisasi!", {
          id: toastId,
        });
        fetchSBTRequests();
      } else {
        toast.error(result.error || "Proses persetujuan otomatis gagal.", {
          id: toastId,
        });
      }
    });
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <h2 className="text-xl font-semibold">Wallet Belum Terhubung</h2>
        <p className="text-muted-foreground max-w-sm">
          Harap hubungkan wallet Anda terlebih dahulu untuk mengakses halaman
          admin.
        </p>
      </div>
    );
  }

  if (!isLoading && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <ShieldOff className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Akses Ditolak</h2>
        <p className="text-muted-foreground max-w-sm">
          Halaman ini hanya dapat diakses oleh admin (pemilik kontrak) registry.
        </p>
      </div>
    );
  }

  const stats = {
    pendingCount: pendingRequests.length,
    registeredCount: registeredList.length,
    sbtRequestCount: sbtRequests.length,
  };

  return (
    <AdminLayout stats={stats} isLoading={isLoading}>
      <section className="mb-10">
        <h1 className="text-xl font-bold mb-4">
          📩 Permintaan Pendaftaran Entitas
        </h1>
        <RequestTable requests={pendingRequests} onRegister={handleRegister} />
      </section>
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">
          🖊️ Permintaan Lencana Verified
        </h2>
        <RequestVerifiedSbtTable
          requests={sbtRequests}
          onApprove={handleApprove}
          isProcessing={isApproving}
        />
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">✅ Entitas Terverifikasi</h2>
        <VerifiedEntityTable data={registeredList} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">📊 Statistik Entitas</h2>
        <VerifiedEntityStats data={registeredList} />
      </section>
    </AdminLayout>
  );
}
