// src/app/dashboard/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { contracts } from "@/lib/contracts";
import { checkRegistryOnChain } from "@/lib/checkRegistryOnChain";
import { InstitutionRequest } from "@/utils/institution";
import AdminLayout from "@/components/admin/AdminLayout";
import RequestTable from "@/components/admin/RequestTable";
import InstitutionTable from "@/components/admin/InstitutionTable";
import InstitutionStats from "@/components/admin/InstitutionStats";
import RequestSBTTable from "@/components/admin/RequestSBTTable";

interface SBTRequest {
  tokenId: string;
  to: string;
  uri: string;
  deadline: string;
}

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { data: owner } = useReadContract({
    address: contracts.registry.address,
    abi: contracts.registry.abi,
    functionName: "owner",
  });
  const { writeContractAsync } = useWriteContract();

  const [requests, setRequests] = useState<InstitutionRequest[]>([]);
  const [registeredList, setRegisteredList] = useState<InstitutionRequest[]>(
    []
  );
  const [sbtRequests, setSbtRequests] = useState<SBTRequest[]>([]);
  const [signedIds, setSignedIds] = useState<bigint[]>([]);

  const isAdmin =
    typeof owner === "string" &&
    typeof address === "string" &&
    owner.toLowerCase() === address.toLowerCase();

  useEffect(() => {
    if (!isConnected || !isAdmin) return;
    fetchInstitutionRequests();
  }, [isConnected, isAdmin]);

  const fetchInstitutionRequests = async () => {
    try {
      const res = await fetch("/api/admin/institution");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("[fetchInstitutionRequests]", err);
    }
  };

  useEffect(() => {
    if (requests.length === 0) return;
    fetchRegisteredInstitutions();
  }, [requests]);

  const fetchRegisteredInstitutions = async () => {
    try {
      const results = await Promise.all(
        requests.map(async (req) => {
          try {
            const isReg = await checkRegistryOnChain(req.walletAddress);
            return isReg ? req : null;
          } catch (err) {
            console.warn("[checkRegistryOnChain]", err);
            return null;
          }
        })
      );
      const filtered = results.filter(Boolean) as InstitutionRequest[];
      setRegisteredList(filtered);
    } catch (err) {
      console.error("[fetchRegisteredInstitutions]", err);
    }
  };

  useEffect(() => {
    fetchSBTData();
  }, []);

  const fetchSBTData = async () => {
    try {
      const [reqRes, sigRes] = await Promise.all([
        fetch("/api/admin/requests"),
        fetch("/api/admin/signed"),
      ]);

      const reqs: SBTRequest[] = await reqRes.json();
      const sigsRaw = await sigRes.json();

      const sigs = Array.isArray(sigsRaw) ? sigsRaw : [];
      setSbtRequests(reqs);
      setSignedIds(sigs.map((s) => BigInt(s.tokenId)));
    } catch (err) {
      console.error("[fetchSBTData]", err);
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
      alert("✅ Institusi berhasil didaftarkan ke registry on-chain");
      fetchInstitutionRequests();
    } catch (err) {
      console.error("[registerInstitution]", err);
      alert("❌ Gagal mendaftarkan institusi.");
    }
  };

  const handleSignedUpdate = (tokenId: string) => {
    setSignedIds((prev) => [...prev, BigInt(tokenId)]);
  };

  const pendingRequests = requests.filter(
    (r) => !registeredList.some((reg) => reg.walletAddress === r.walletAddress)
  );

  if (!isConnected) {
    return <div className="p-4">Harap hubungkan wallet terlebih dahulu.</div>;
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
      <section>
        <h1 className="text-xl font-bold mb-4">
          📩 Permintaan Pendaftaran Institusi
        </h1>
        <RequestTable requests={pendingRequests} onRegister={handleRegister} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">✅ Institusi Terdaftar</h2>
        <InstitutionTable data={registeredList} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">
          🖊️ Permintaan Signature SBT
        </h2>
        <RequestSBTTable
          requests={sbtRequests}
          signed={signedIds}
          onSigned={handleSignedUpdate}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">📊 Statistik Institusi</h2>
        <InstitutionStats data={registeredList} />
      </section>
    </AdminLayout>
  );
}
