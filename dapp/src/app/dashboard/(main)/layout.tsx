// src/app/dashboard/(main)/layout.tsx
"use client"; // Layout ini harus client component karena menggunakan hook

import { Web3Provider } from "@/lib/walletProviders/wallet";
import SideNav from "@/components/SideNav";
import { ProfileSetupProvider } from "@/components/auth/ProfileSetupProvider";
import { WebSocketProvider } from "@/components/auth/WebSocketProvider";

// PENTING: Karena layout ini sekarang Client Component, kita tidak bisa
// lagi mengambil `initialState` dari server di sini. Wagmi v2 akan
// menanganinya dengan baik di sisi klien.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Semua provider Web3 & aplikasi sekarang hanya dimuat di sini
    // initialState tidak lagi diperlukan di sini untuk Wagmi v2
    <Web3Provider>
      <WebSocketProvider />
      <ProfileSetupProvider>
        <SideNav>{children}</SideNav>
      </ProfileSetupProvider>
    </Web3Provider>
  );
}
