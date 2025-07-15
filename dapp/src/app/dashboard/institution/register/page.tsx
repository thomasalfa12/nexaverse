"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import clsx from "clsx";
import { useAccount } from "wagmi";
import { writeContract, getWalletClient } from "@wagmi/core";
import { contracts } from "@/lib/contracts";
import { wagmiConfig } from "@/lib/wallet";

interface RequestItem {
  tokenId: number;
  uri: string;
  deadline: number;
  to: string;
  signature?: `0x${string}`;
  status: "pending" | "signed";
}

export default function RegisterPage() {
  const { address } = useAccount();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [form, setForm] = useState({ tokenId: "", uri: "", deadline: "" });

  useEffect(() => {
    fetch("/api/admin/requests")
      .then((res) => res.json())
      .then(setRequests);
  }, []);

  useEffect(() => {
    fetch("/api/admin/signed")
      .then((res) => res.json())
      .then((signed) => {
        setRequests((prev) =>
          prev.map((req) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const match = signed.find((s: any) => s.tokenId === req.tokenId);
            return match ? { ...req, status: "signed", signature: match.signature } : req;
          })
        );
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tokenId = Number(form.tokenId);
    const deadline = Math.floor(new Date(form.deadline).getTime() / 1000);
    const uri = form.uri.trim().toLowerCase();

    if (!/^0x[a-f0-9]{64}$/.test(uri)) return alert("❌ URI harus berupa hash 0x + 64 hex");
    if (!address) return alert("Wallet tidak terhubung");

    const newReq = { tokenId, uri, deadline, to: address, status: "pending" };
    await fetch("/api/admin/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReq),
    });
    setRequests((prev) => [...prev, newReq]);
    setForm({ tokenId: "", uri: "", deadline: "" });
  }

  async function handleClaim(req: RequestItem) {
    try {
      const client = await getWalletClient(wagmiConfig);
      if (!client) return alert("Wallet not connected");

      await writeContract(wagmiConfig, {
        address: contracts.institution.address,
        abi: contracts.institution.abi,
        functionName: "claim",
        account: client.account.address,
        args: [BigInt(req.tokenId), req.uri.toLowerCase(), BigInt(req.deadline), req.signature],
      });

      alert("✅ Berhasil klaim SBT!");
    } catch (err) {
      console.error(err);
      alert("❌ Claim gagal, cek console dan signature");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-10">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-xl font-semibold">Request Signature</h1>
        <input
          type="number"
          required
          placeholder="Token ID"
          className="w-full rounded border px-3 py-2 text-sm"
          value={form.tokenId}
          onChange={(e) => setForm({ ...form, tokenId: e.target.value })}
        />
        <input
          type="text"
          required
          placeholder="Metadata URI (0x...hash)"
          className="w-full rounded border px-3 py-2 text-sm"
          value={form.uri}
          onChange={(e) => setForm({ ...form, uri: e.target.value })}
        />
        <input
          type="datetime-local"
          required
          className="w-full rounded border px-3 py-2 text-sm"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />
        <button
          type="submit"
          className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          Submit Request
        </button>
      </form>

      <div>
        <h2 className="mb-2 text-lg font-medium">Status Requests</h2>
        <ul className="divide-y rounded border">
          {requests.map((req, i) => (
            <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium">Token ID: {req.tokenId}</p>
                <p className="text-xs text-gray-500">{req.uri}</p>
              </div>
              <div className="text-right">
                <p>{formatDistanceToNowStrict(req.deadline * 1000)} left</p>
                <span className={clsx("text-xs font-semibold", req.status === "pending" ? "text-yellow-500" : "text-green-500")}>{req.status}</span>
                {req.status === "signed" && req.signature && (
                  <button
                    onClick={() => handleClaim(req)}
                    className="ml-2 mt-1 rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                  >
                    Claim
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
