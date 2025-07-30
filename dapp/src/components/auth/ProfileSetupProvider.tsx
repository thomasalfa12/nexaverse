"use client";

import { useState, useEffect } from "react";
// Asumsikan Anda memiliki hook `useAuth` dari `AuthProviders` Anda
// yang memberikan status otentikasi dari backend.
import { useAuth } from "@/components/auth/AuthProviders";
import { ProfileSetupModal } from "./ProfileSetupModal";

export function ProfileSetupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gunakan status otentikasi backend, bukan hanya status koneksi dompet
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    // Hanya periksa jika proses pengecekan otentikasi selesai dan pengguna terotentikasi
    if (isAuthenticated && !isAuthLoading) {
      const checkProfile = async () => {
        try {
          const res = await fetch("/api/me/profile/status");
          if (res.ok) {
            const data = await res.json();
            // Tampilkan modal jika API mengatakan `hasProfile` adalah `false`
            setNeedsProfile(!data.hasProfile);
          }
        } catch (error) {
          console.error("Failed to check profile status:", error);
        }
      };
      checkProfile();
    } else {
      // Jika pengguna tidak terotentikasi, pastikan modal disembunyikan
      setNeedsProfile(false);
    }
  }, [isAuthenticated, isAuthLoading]); // Jalankan ulang efek saat status otentikasi berubah

  return (
    <>
      {children}
      <ProfileSetupModal
        isOpen={needsProfile}
        onFinished={() => setNeedsProfile(false)}
      />
    </>
  );
}
