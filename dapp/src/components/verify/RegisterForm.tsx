"use client";

import { useEffect, useState, useTransition, FormEvent } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Shadcn UI & Lucide Icons
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Building,
  Globe,
  Mail,
  Check,
  Send,
  FileClock,
} from "lucide-react";

type Props = {
  onSuccess?: () => void;
};

// Komponen untuk tampilan "Submission Success" (tidak berubah, sudah bagus)
const SubmissionSuccessView = () => {
  return (
    <div className="text-center p-4 sm:p-8 flex flex-col items-center justify-center min-h-[300px]">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <FileClock className="h-16 w-16 text-blue-500 mb-6" />
      </motion.div>
      <motion.h3
        className="text-xl font-bold text-gray-800"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Pendaftaran Terkirim
      </motion.h3>
      <motion.p
        className="text-gray-500 mt-2 max-w-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Data Anda telah kami terima. Silakan tunggu sementara tim admin kami
        melakukan verifikasi.
      </motion.p>
    </div>
  );
};

export default function RegisterForm({ onSuccess }: Props) {
  const { address } = useAccount();
  const [form, setForm] = useState({
    name: "",
    email: "",
    primaryUrl: "",
    type: "",
  });
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const check = async () => {
      if (!address) return;
      try {
        const res = await fetch(`/api/user/address-check?wallet=${address}`);
        if (!res.ok) return; // Tambahkan pengecekan jika API gagal
        const data = await res.json();
        setIsAlreadyRegistered(data.registered);
        setSubmitted(data.submitted ?? false);
      } catch (err) {
        console.error("Gagal fetch status entitas", err);
      }
    };
    check();
  }, [address]);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!address) return toast.error("Wallet belum terhubung");

    startTransition(async () => {
      // SINKRONISASI: Payload disesuaikan dengan skema dan kontrak final
      const payload = {
        name: form.name,
        primaryUrl: form.primaryUrl,
        contactEmail: form.email,
        walletAddress: address,
        entityType: parseInt(form.type),
      };

      try {
        // SINKRONISASI: Menggunakan endpoint yang benar
        const res = await fetch("/api/admin/registry/register-entity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          toast.success("Permintaan pendaftaran berhasil dikirim.");
          setSubmitted(true);
          onSuccess?.();
        } else {
          const error = await res.json();
          toast.error(error?.error || "Gagal mengirim permintaan.");
        }
      } catch (err) {
        toast.error("Terjadi kesalahan saat mengirim.");
        console.error(err);
      }
    });
  };

  if (!address) {
    return (
      <p className="text-sm text-center text-gray-500 p-4">
        🔌 Silakan hubungkan wallet Anda terlebih dahulu.
      </p>
    );
  }

  if (isAlreadyRegistered) {
    return (
      <div className="flex items-center justify-center text-sm text-green-600 p-4 gap-2">
        <Check className="h-5 w-5" />
        <p>Alamat wallet ini sudah terdaftar sebagai entitas terverifikasi.</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-lg border-0 shadow-none bg-transparent">
      <CardContent className="p-1">
        {submitted ? (
          <SubmissionSuccessView />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Entitas (Institusi/Komunitas/Anda)
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh: Nexaverse Foundation"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryUrl">
                URL Utama (Website/Twitter/Portfolio)
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="primaryUrl"
                  name="primaryUrl" // SINKRONISASI: Menggunakan `primaryUrl`
                  placeholder="nexaverse.xyz"
                  value={form.primaryUrl}
                  onChange={handleFormChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Kontak</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contact@nexaverse.xyz"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Jenis Entitas</Label>
              <Select
                name="type"
                required
                onValueChange={(value) => handleChange("type", value)}
                value={form.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis entitas Anda" />
                </SelectTrigger>
                {/* SINKRONISASI: Opsi disesuaikan dengan enum `EntityType` di kontrak */}
                <SelectContent>
                  <SelectItem value="1">
                    Institusi (Universitas, Sekolah, Perusahaan)
                  </SelectItem>
                  <SelectItem value="2">
                    Kreator (Individu, Pengajar)
                  </SelectItem>
                  <SelectItem value="3">
                    Komunitas (Guild, Grup Online)
                  </SelectItem>
                  <SelectItem value="4">DAO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full text-base py-6"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              Kirim Pendaftaran
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
