"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { contracts } from "@/lib/contracts";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type SignedItem = {
  tokenId: string;
  to: `0x${string}`;
  uri: string;
  deadline: string;
  sig: `0x${string}`;
};

export default function ClaimPage() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [signatureData, setSignatureData] = useState<SignedItem | null>(null);

  useEffect(() => {
    if (!address) return;

    const fetchSignature = async () => {
      setLoading(true);
      setError(false);

      try {
        const res = await fetch(`/api/admin/signed/${address}`);
        if (!res.ok) {
          setError(true);
          return;
        }

        const data = await res.json();
        const match = Array.isArray(data) && data.length > 0 ? data[0] : null;

        if (
          match?.tokenId &&
          match?.to &&
          match?.uri &&
          match?.deadline &&
          match?.signature
        ) {
          setSignatureData(match);
        } else {
          setSignatureData(null);
          setError(true);
        }
      } catch (err) {
        console.error("❌ Failed to fetch signature", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSignature();
  }, [address]);

  const handleClaim = async () => {
    if (
      !signatureData ||
      !signatureData.tokenId ||
      !signatureData.uri ||
      !signatureData.deadline ||
      !signatureData.sig
    ) {
      toast.error("❌ Data tidak lengkap untuk klaim.");
      return;
    }

    try {
      const { tokenId, uri, deadline, sig } = signatureData;

      await writeContractAsync({
        address: contracts.institution.address,
        abi: contracts.institution.abi,
        functionName: "claim",
        args: [BigInt(tokenId), uri, BigInt(deadline), sig],
      });

      toast.success("✅ Berhasil klaim SBT");
      router.push("/dashboard");
    } catch (err) {
      console.error("[CLAIM ERROR]", err);
      toast.error("❌ Gagal klaim SBT");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        ⏳ Memuat data signature...
      </div>
    );
  }

  if (error || !signatureData) {
    return (
      <div className="p-6 text-center text-red-600">
        ❌ Signature belum tersedia atau belum ditandatangani admin.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🪪 Claim Soulbound Token</h1>
      <div className="border p-4 rounded bg-gray-50 text-sm space-y-2">
        <p>
          <strong>Token ID:</strong> {signatureData.tokenId}
        </p>
        <p>
          <strong>Recipient:</strong> {signatureData.to}
        </p>
        <p>
          <strong>URI:</strong>{" "}
          {signatureData.uri
            ? `${signatureData.uri.slice(0, 80)}...`
            : "(tidak tersedia)"}
        </p>
        <p>
          <strong>Deadline:</strong>{" "}
          {new Date(Number(signatureData.deadline) * 1000).toLocaleString()}
        </p>
      </div>

      <button
        onClick={handleClaim}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        🚀 Claim SBT Sekarang
      </button>
    </div>
  );
}
