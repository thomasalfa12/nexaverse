"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { contracts } from "@/lib/contracts";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import RequestTable from "@/components/admin/RequestTable";
import InstitutionTable from "@/components/admin/InstitutionTable";
import InstitutionStats from "@/components/admin/InstitutionStats";
import RequestSBTTable from "@/components/admin/RequestSBTTable";
import type { InstitutionRequest, InstitutionList } from "@/utils/institution";
import type { SBTRequest } from "@/components/admin/RequestSBTTable";
import { toast } from "sonner";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const router = useRouter();

  const { data: owner } = useReadContract({
    address: contracts.registry.address,
    abi: contracts.registry.abi,
    functionName: "owner",
  });

  const [requests, setRequests] = useState<InstitutionRequest[]>([]);
  const [registeredList, setRegisteredList] = useState<InstitutionList[]>([]);
  const [sbtRequests, setSbtRequests] = useState<SBTRequest[]>([]);
  const [approvedAddresses, setApprovedAddresses] = useState<string[]>([]);

  const isAdmin =
    typeof owner === "string" &&
    typeof address === "string" &&
    owner.toLowerCase() === address.toLowerCase();

  useEffect(() => {
    if (!isConnected || !isAdmin) return;
    fetchInstitutionData();
    fetchSBTRequests();
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

      setRequests(pending);
      setRegisteredList(registered); // Should be InstitutionList[]
    } catch (err) {
      console.error("[fetchInstitutionData]", err);
      toast.error("Gagal memuat data institusi.");
    }
  };

  const fetchSBTRequests = async () => {
    try {
      const res = await fetch("/api/admin/registry/mint-request");
      const approvedRes = await fetch("/api/admin/registry/signed");

      const dbRequests: { id: number; Address: string; uri?: string }[] =
        await res.json();

      const approvedData: { address: string }[] = await approvedRes.json();
      const approved = approvedData.map((d) => d.address.toLowerCase());

      const requests: SBTRequest[] = dbRequests.map((item) => ({
        to: item.Address,
        tokenId: item.id.toString(),
        uri: item.uri ?? "",
      }));

      setSbtRequests(requests);
      setApprovedAddresses(approved);
    } catch (err) {
      console.error("[fetchSBTRequests]", err);
      toast.error("Gagal memuat data mint request.");
    }
  };

  const handleRegister = async (institution: InstitutionRequest) => {
    try {
      await writeContractAsync({
        address: contracts.registry.address,
        abi: contracts.registry.abi,
        functionName: "registerInstitution",
        args: [
          institution.walletAddress,
          institution.name,
          institution.officialWebsite,
          institution.contactEmail,
          institution.institutionType,
        ],
      });

      toast.success("✅ Institusi berhasil didaftarkan ke registry");
      await fetchInstitutionData();
    } catch (err) {
      console.error("[handleRegister]", err);
      toast.error("❌ Gagal mendaftarkan institusi.");
    }
  };

  const handleApprove = async (req: SBTRequest) => {
    const tokenId = req.tokenId;
    const uri = prompt("Masukkan URI metadata (ipfs://...)", req.uri || "");

    if (!uri) {
      toast.error("URI tidak boleh kosong.");
      return;
    }

    try {
      await writeContractAsync({
        address: contracts.institution.address,
        abi: contracts.institution.abi,
        functionName: "approveMintRequest",
        args: [req.to, uri],
      });

      const res = await fetch("/api/admin/registry/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: req.to, tokenId, uri }),
      });

      if (!res.ok) {
        throw new Error("Gagal simpan approval ke DB");
      }

      toast.success("✅ Berhasil menyetujui mint SBT");
      router.refresh();
    } catch (err) {
      console.error("[handleApprove]", err);
      toast.error("❌ Gagal menyetujui mint.");
    }
  };

  const pendingRequests = requests.filter(
    (r) => !registeredList.some((reg) => reg.walletAddress === r.walletAddress)
  );

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
        <RequestSBTTable
          requests={sbtRequests}
          approved={approvedAddresses}
          onApprove={handleApprove}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">📊 Statistik Institusi</h2>
        <InstitutionStats data={registeredList} />
      </section>
    </AdminLayout>
  );
}
