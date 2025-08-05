"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ProfileSetupModal } from "./ProfileSetupModal";

// Definisikan tipe data yang akan diterima dari modal
type ProfileUpdatePayload = {
  name?: string;
  image?: string | null;
  email?: string | null;
};

export function ProfileSetupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status, update } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.profileComplete === false
    ) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [session, status]);

  /**
   * REFACTOR FINAL: Fungsi ini sekarang menerima 'data' dari modal
   * dan meneruskannya ke fungsi update() dari Next-Auth.
   * Ini adalah metode "update optimistik" yang andal.
   */
  const handleFinishSetup = async (data: ProfileUpdatePayload) => {
    // Jika tidak ada nama, berarti modal ditutup tanpa submit, jangan lakukan apa-apa
    if (!data.name) {
      // Anda bisa mempertimbangkan untuk menutup modal di sini jika diperlukan,
      // tetapi logika useEffect sudah menanganinya.
      return;
    }

    console.log(
      "PROVIDER: 🔄 Memulai proses update OPTIMISTIK dengan data:",
      data
    );

    try {
      // Panggil update() DENGAN data baru.
      // Ini akan langsung memperbarui sesi di client tanpa perlu refetch.
      await update(data);

      console.log("PROVIDER: ✅ Session berhasil diupdate secara optimistik");

      // Menutup modal sekarang aman karena sesi di client sudah diperbarui
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
