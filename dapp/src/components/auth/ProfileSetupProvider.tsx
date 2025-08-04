"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ProfileSetupModal } from "./ProfileSetupModal";

export function ProfileSetupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status, update } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Logika sederhana: tampilkan modal jika profil belum lengkap.
    if (
      status === "authenticated" &&
      session?.user?.profileComplete === false
    ) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [session, status]);

  // Fix: Buat function async untuk memenuhi tipe yang diharapkan
  const handleFinishSetup = async () => {
    console.log("PROVIDER: 🔄 Memulai proses update session...");

    try {
      // Trigger session update untuk mendapatkan data terbaru
      console.log("PROVIDER: 📡 Memanggil session.update()...");
      await update();

      console.log("PROVIDER: ✅ Session berhasil diupdate");

      // Tutup modal
      setIsModalOpen(false);

      console.log("PROVIDER: 🎉 Modal ditutup, setup selesai");
    } catch (error) {
      console.error("PROVIDER: ❌ Error saat update session:", error);
      // Tetap tutup modal meskipun ada error
      setIsModalOpen(false);
    }
  };

  return (
    <>
      {children}
      <ProfileSetupModal isOpen={isModalOpen} onFinished={handleFinishSetup} />
    </>
  );
}
