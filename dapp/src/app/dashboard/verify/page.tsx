"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { checkRegistryOnChain } from "@/lib/checkRegistryOnChain";
import { SBTRequest, SBTSignature } from "@/utils/sbt";

export default function VerifyPage() {
  const { address } = useAccount();
  const router = useRouter();

  const [isRegistered, setIsRegistered] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);

  useEffect(() => {
    if (!address) return;

    const runChecks = async () => {
      try {
        const lowerAddr = address.toLowerCase();

        // 1. Registry check (on-chain)
        const registered = await checkRegistryOnChain(address);
        setIsRegistered(registered);

        // 2. Request check (off-chain)
        const reqRes = await fetch("/api/admin/requests");
        const reqList: SBTRequest[] = await reqRes.json();
        const requested = reqList.some((r) => r.to.toLowerCase() === lowerAddr);
        setHasRequested(requested);

        // 3. Signature check (off-chain)
        const sigRes = await fetch(`/api/admin/signed/${address}`);
        const sigList: SBTSignature[] = await sigRes.json();
        const signed =
          Array.isArray(sigList) &&
          sigList.some((s) => s.to.toLowerCase() === lowerAddr);
        setIsSigned(signed);

        // 4. Claimed check (on-chain)
        const balanceRes = await fetch("/api/contract/institution/balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        });

        const result = await balanceRes.json();
        const balance =
          typeof result.balance === "string"
            ? BigInt(result.balance)
            : BigInt(0);
        setIsClaimed(balance > 0n);
      } catch (err) {
        console.error("❌ Verifikasi gagal:", err);
      }
    };

    runChecks();
  }, [address]);

  const renderStatus = (
    done: boolean,
    label: string,
    action?: () => void,
    actionLabel?: string
  ) => (
    <tr className="border-b">
      <td className="p-4 font-medium">{label}</td>
      <td className="p-4 text-center">
        {done ? (
          <span className="text-green-600 font-semibold">✅ Selesai</span>
        ) : action ? (
          <button onClick={action} className="text-blue-600 underline">
            {actionLabel}
          </button>
        ) : (
          <span className="text-yellow-600">⏳ Menunggu</span>
        )}
      </td>
    </tr>
  );

  if (!address) {
    return (
      <div className="p-6 text-center">
        🔌 Hubungkan wallet Anda untuk memverifikasi status.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Verifikasi Institusi</h1>

      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-4 font-semibold">Tahapan</th>
              <th className="p-4 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {renderStatus(
              isRegistered,
              "1. Daftar di Registry",
              !isRegistered
                ? () => router.push("/dashboard/institution/register")
                : undefined,
              "Daftar Sekarang"
            )}
            {renderStatus(
              hasRequested,
              "2. Request Signature SBT",
              isRegistered && !hasRequested
                ? () => router.push("/dashboard/institution/request")
                : undefined,
              "Kirim Request"
            )}
            {renderStatus(isSigned, "3. Tanda Tangan oleh Admin")}
            {renderStatus(
              isClaimed,
              "4. Claim SBT",
              isSigned && !isClaimed
                ? () => router.push("/dashboard/institution/claim")
                : undefined,
              "Claim Sekarang"
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
