// src/components/auth/ProfileSetupProvider.tsx (Sudah Benar ✅)

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
  const [setupJustCompleted, setSetupJustCompleted] = useState(false);

  useEffect(() => {
    // Logika ini sekarang akan berjalan dengan benar
    if (
      !setupJustCompleted &&
      status === "authenticated" &&
      session.user?.profileComplete === false
    ) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [session, status, setupJustCompleted]);

  const handleFinishSetup = async () => {
    setSetupJustCompleted(true);
    setIsModalOpen(false);
    // `update()` akan memicu callback di `lib/auth.ts` untuk menyegarkan sesi
    await update();
  };

  return (
    <>
      {children}
      <ProfileSetupModal isOpen={isModalOpen} onFinished={handleFinishSetup} />
    </>
  );
}
