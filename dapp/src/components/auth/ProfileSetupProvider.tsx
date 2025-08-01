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

  // State ini adalah kunci untuk memutus loop.
  const [setupJustCompleted, setSetupJustCompleted] = useState(false);

  useEffect(() => {
    // Tampilkan modal HANYA JIKA:
    // 1. Sesi sudah terotentikasi.
    // 2. Profil pengguna belum lengkap.
    // 3. Proses setup TIDAK baru saja selesai.
    if (
      !setupJustCompleted &&
      status === "authenticated" &&
      session.user?.profileComplete === false
    ) {
      setIsModalOpen(true);
    } else {
      // Dalam kasus lain, pastikan modal tertutup.
      setIsModalOpen(false);
    }
  }, [session, status, setupJustCompleted]);

  const handleFinishSetup = async () => {
    // 1. Set flag ini menjadi `true` SEKARANG. Ini akan mencegah useEffect
    //    di atas untuk membuka kembali modal berdasarkan data sesi yang lama.
    setSetupJustCompleted(true);

    // 2. Tutup modal secara visual untuk UX yang instan.
    setIsModalOpen(false);

    // 3. Minta NextAuth untuk menyegarkan data sesi di latar belakang.
    // Setelah ini selesai, `session.user.profileComplete` akan menjadi `true`.
    await update();
  };

  return (
    <>
      {children}
      <ProfileSetupModal isOpen={isModalOpen} onFinished={handleFinishSetup} />
    </>
  );
}
