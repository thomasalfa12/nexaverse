"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { contracts } from "@/lib/contracts";
// REMOVED: useRouter tidak digunakan
// import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import RequestTable from "@/components/admin/RequestTable";
import InstitutionTable from "@/components/admin/InstitutionTable";
import InstitutionStats from "@/components/admin/InstitutionStats";
import RequestSBTTable, {
  type SbtMintWithInstitution, // Tipe ini sudah benar
} from "@/components/admin/RequestSBTTable";
import type { Institution } from "@prisma/client"; // Tipe ini dibutuhkan
// REMOVED: SbtMint dari prisma tidak digunakan langsung di sini
// REMOVED: SBTRequest tidak lagi ada
// import type { SBTRequest } from "@/components/admin/RequestSBTTable";
import { toast } from "sonner";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const { data: owner } = useReadContract({
    address: contracts.registry.address,
    abi: contracts.registry.abi,
    functionName: "owner",
  });

  const [pendingRequests, setPendingRequests] = useState<Institution[]>([]);
  const [registeredList, setRegisteredList] = useState<Institution[]>([]);
  // FIX: Gunakan tipe data yang benar dari komponen anak
  const [sbtRequests, setSbtRequests] = useState<SbtMintWithInstitution[]>([]);

  const isAdmin =
    typeof owner === "string" &&
    typeof address === "string" &&
    owner.toLowerCase() === address.toLowerCase();

  useEffect(() => {
    if (isConnected && isAdmin) {
      fetchInstitutionData();
      fetchSBTRequests();
    }
  }, [isConnected, isAdmin]);

  const fetchInstitutionData = async () => {
    try {
      const [resPending, resRegistered] = await Promise.all([
        fetch("/api/admin/registry/register-institution"),
        fetch("/api/admin/registry/registered"),
      ]);

      const [pending, registered] = await Promise.all([
        resPending.json(),
        resRegistered.json(),
      ]);

      setPendingRequests(pending);
      setRegisteredList(registered);
    } catch (err) {
      console.error("[fetchInstitutionData]", err);
      toast.error("Gagal memuat data institusi.");
    }
  };

  const fetchSBTRequests = async () => {
    try {
      const res = await fetch("/api/admin/registry/sbt-requests");
      if (!res.ok) throw new Error("Gagal memuat permintaan SBT");
      // Tipe data di sini sudah benar
      const data: SbtMintWithInstitution[] = await res.json();
      setSbtRequests(data);
    } catch (err) {
      console.error("[fetchSBTRequests]", err);
      toast.error("Gagal memuat permintaan SBT.");
    }
  };

  const handleRegister = async (institution: Institution) => {
    if (!publicClient) {
      toast.error("Gagal terhubung ke provider blockchain.");
      return;
    }
    try {
      toast.info("Silakan konfirmasi transaksi di wallet Anda...");
      const txHash = await writeContractAsync({
        address: contracts.registry.address,
        abi: contracts.registry.abi,
        functionName: "registerInstitution",
        args: [
          institution.walletAddress as `0x${string}`,
          institution.name,
          institution.officialWebsite,
          institution.contactEmail,
          institution.institutionType,
        ],
      });

      toast.loading("Transaksi dikirim, menunggu konfirmasi on-chain...", {
        id: "tx-receipt",
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (receipt.status === "reverted") {
        throw new Error("Transaksi on-chain gagal (reverted).");
      }

      toast.dismiss("tx-receipt");
      toast.success("Transaksi on-chain berhasil!");

      const res = await fetch("/api/admin/registry/finalize-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionId: institution.id,
          txHash: txHash,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal memperbarui status di database.");
      }

      toast.success("✅ Institusi berhasil terdaftar on-chain dan off-chain!");
      fetchInstitutionData();
    } catch (err: unknown) {
      // FIX: Gunakan `unknown` untuk type safety
      toast.dismiss("tx-receipt");
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan tidak diketahui.";
      console.error("[handleRegister]", err);
      toast.error(errorMessage);
    }
  };

  const handleApprove = async (req: SbtMintWithInstitution) => {
    if (!publicClient) {
      toast.error("Gagal terhubung ke provider blockchain.");
      return;
    }

    const uri = prompt("Masukkan URI metadata (ipfs://...)", req.uri || "");
    if (!uri) return toast.error("URI tidak boleh kosong.");

    try {
      toast.info("Silakan konfirmasi transaksi persetujuan di wallet...");
      const txHash = await writeContractAsync({
        address: contracts.institution.address,
        abi: contracts.institution.abi,
        functionName: "approveMintRequest",
        args: [req.institution.walletAddress, uri],
      });

      toast.loading("Transaksi persetujuan dikirim, menunggu konfirmasi...", {
        id: "sbt-approve-tx",
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      if (receipt.status === "reverted")
        throw new Error("Transaksi on-chain gagal.");

      toast.dismiss("sbt-approve-tx");
      toast.success("Persetujuan on-chain berhasil!");

      await fetch("/api/admin/registry/finalize-sbt-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sbtMintId: req.id, uri, txHash }),
      });

      toast.success("✅ Persetujuan SBT berhasil disinkronkan!");
      fetchSBTRequests();
    } catch (err: unknown) {
      toast.dismiss("sbt-approve-tx");
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan tidak diketahui.";
      console.error("[handleApprove]", err);
      toast.error(errorMessage);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-4 text-muted-foreground">
        Harap hubungkan wallet terlebih dahulu.
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-4 text-red-600">
        🚫 Akses ditolak. Hanya admin (owner) yang dapat mengakses halaman ini.
      </div>
    );
  }

  return (
    <AdminLayout>
      <section className="mb-10">
        <h1 className="text-xl font-bold mb-4">
          📩 Permintaan Pendaftaran Institusi
        </h1>
        <RequestTable requests={pendingRequests} onRegister={handleRegister} />
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">✅ Institusi Terdaftar</h2>
        <InstitutionTable data={registeredList} />
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">🖊️ Permintaan Mint SBT</h2>
        <RequestSBTTable requests={sbtRequests} onApprove={handleApprove} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">📊 Statistik Institusi</h2>
        <InstitutionStats data={registeredList} />
      </section>
    </AdminLayout>
  );
}
