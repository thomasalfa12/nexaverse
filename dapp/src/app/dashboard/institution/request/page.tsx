// app/request/page.tsx
"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { isAddress } from "viem";

export default function RequestSignaturePage() {
  const { address } = useAccount();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!address || !isAddress(address)) {
      setStatus("Alamat wallet tidak valid");
      return;
    }

    setLoading(true);
    setStatus(null);

    const res = await fetch("/api/admin/requests", {
      method: "POST",
      body: JSON.stringify({ address }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setStatus("Berhasil mengirim permintaan signature ke admin.");
    } else {
      setStatus("Gagal mengirim permintaan.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 bg-white rounded shadow space-y-4">
      <h1 className="text-xl font-bold text-gray-800">
        Permintaan Signature SBT
      </h1>

      <p className="text-sm text-gray-600">
        Sistem akan otomatis mengambil data institusi Anda dari registry. Anda
        hanya perlu menekan tombol di bawah ini untuk mengirim permintaan
        signature ke admin.
      </p>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Mengirim..." : "Kirim Permintaan Signature"}
      </button>

      {status && (
        <p className="text-center text-sm text-gray-700 mt-2">{status}</p>
      )}
    </div>
  );
}
