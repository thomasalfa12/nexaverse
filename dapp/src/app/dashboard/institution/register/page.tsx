"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { checkRegistryOnChain } from "@/lib/checkRegistryOnChain";

interface FormState {
  name: string;
  type: string;
  website: string;
  email: string;
}

export default function InstitutionRegisterPage() {
  const { address } = useAccount();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: "",
    type: "",
    website: "",
    email: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "submitted">(
    "idle"
  );
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  // Cek apakah wallet sudah terdaftar on-chain
  useEffect(() => {
    const check = async () => {
      if (address) {
        const result = await checkRegistryOnChain(address);
        setIsRegistered(result);
      }
    };
    check();
  }, [address]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!address) return alert("Wallet belum terhubung");

    setStatus("submitting");

    const payload = {
      name: form.name,
      officialWebsite: form.website,
      contactEmail: form.email,
      walletAddress: address,
      institutionType: parseInt(form.type),
    };

    try {
      const res = await fetch("/api/admin/institution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus("submitted");
      } else {
        const err = await res.json();
        alert("Gagal: " + err.error);
        setStatus("idle");
      }
    } catch (err) {
      console.error("[submit error]", err);
      alert("Terjadi kesalahan.");
      setStatus("idle");
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Daftar Institusi
      </h1>

      {isRegistered ? (
        <div className="bg-green-100 text-green-800 p-4 rounded-md">
          ✅ Institusi Anda telah terdaftar di registry on-chain.
          <br />
          👉{" "}
          <button
            onClick={() => router.push("/dashboard/institution/request")}
            className="underline text-blue-600"
          >
            Lanjut ke Request Signature
          </button>
        </div>
      ) : status === "submitted" ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md">
          ⏳ Data berhasil dikirim. Silakan tunggu admin melakukan verifikasi
          dan pendaftaran on-chain.
        </div>
      ) : (
        <form className="space-y-4 max-w-lg" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium mb-1">Nama Institusi</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-white dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Jenis Institusi</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-white dark:bg-gray-900 dark:text-white"
            >
              <option value="">Pilih jenis</option>
              <option value="1">Universitas</option>
              <option value="2">Sekolah</option>
              <option value="3">Pemerintah</option>
              <option value="4">Perusahaan</option>
              <option value="5">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Website Resmi</label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-white dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Email Kontak</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-white dark:bg-gray-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {status === "submitting" ? "Mengirim..." : "Kirim Pendaftaran"}
          </button>
        </form>
      )}
    </div>
  );
}
