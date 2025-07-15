"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { writeContract } from "@wagmi/core";
import { contracts } from "@/lib/contracts";
import { wagmiConfig } from "@/lib/wallet";

export default function RegisterInstitutionPage() {
  const { address } = useAccount();
  const [isRegistering, setIsRegistering] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!address) return alert("Wallet not connected");

    setIsRegistering(true);
    setError(null);
    try {
      await writeContract(wagmiConfig, {
        address: contracts.registry.address,
        abi: contracts.registry.abi,
        functionName: "registerInstitution",
        args: [address],
        account: address,
      });
      setDone(true);
    } catch (err) {
      console.error(err);
      setError(
        "Gagal mendaftar. Pastikan wallet belum terdaftar dan jaringan sesuai."
      );
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <section className="max-w-md mx-auto py-10">
      <h1 className="text-xl font-semibold mb-4">Daftar sebagai Institusi</h1>

      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Wallet Anda: <span className="font-mono">{address}</span>
      </p>

      <button
        disabled={isRegistering || done}
        onClick={handleRegister}
        className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {done
          ? "Terdaftar"
          : isRegistering
          ? "Mendaftarkan..."
          : "Daftar ke Registry"}
      </button>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </section>
  );
}
