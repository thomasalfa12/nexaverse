"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignTypedData, useWalletClient } from "wagmi";
import { buildSbtSignatureArgs } from "@/utils/sbtSignature";
import { contracts } from "@/lib/contracts";

interface RequestItem {
  tokenId: number;
  to: string;
  uri: string;
  deadline: number;
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { signTypedDataAsync } = useSignTypedData();

  useEffect(() => {
    fetch("/api/admin/requests")
      .then((res) => res.json())
      .then(setRequests);
  }, []);

  async function handleSign(req: RequestItem) {
    const { tokenId, to, uri, deadline } = req;
    try {
      if (!walletClient || !address || !isConnected) {
        return alert("🔌 Wallet belum terhubung!");
      }

      const { domain, types, message, primaryType } =
        await buildSbtSignatureArgs({
          walletClient,
          verifyingContract: contracts.institution.address,
          tokenId,
          to,
          uri,
          deadline,
        });

      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType,
        message,
      });

      await fetch("/api/admin/signed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...message, signature }),
      });

      alert("✅ Signature berhasil dibuat & disimpan!");
    } catch (err) {
      console.error("❌ Gagal sign:", err);
      alert("Terjadi error saat signing. Lihat console.");
    }
  }

  return (
    <section className="p-6">
      <h2 className="text-xl font-bold mb-4">Pending Institution Requests</h2>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-zinc-800">
            <th className="p-2 text-left">Token ID</th>
            <th className="p-2 text-left">To</th>
            <th className="p-2 text-left">URI</th>
            <th className="p-2 text-left">Deadline</th>
            <th className="p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.tokenId}>
              <td className="p-2">{req.tokenId}</td>
              <td className="p-2">{req.to}</td>
              <td className="p-2">{req.uri}</td>
              <td className="p-2">
                {new Date(req.deadline * 1000).toLocaleString()}
              </td>
              <td className="p-2">
                <button
                  onClick={() => handleSign(req)}
                  className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                >
                  Sign
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
