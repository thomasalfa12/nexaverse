"use client";

import React, { useState, useEffect, ReactNode } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  getDefaultConfig,
  lightTheme,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, type State, useAccount } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";

export const wagmiConfig = getDefaultConfig({
  appName: "Nexaverse",
  projectId: process.env.NEXT_PUBLIC_WCT_PROJECT_ID!,
  chains: [baseSepolia],
  ssr: true,
});

const queryClient = new QueryClient();

function WalletSessionManager() {
  const { data: session, status } = useSession();
  const { address: walletAddress, isConnected } = useAccount();

  useEffect(() => {
    // Cek hanya jika sesi NextAuth sudah terotentikasi dan wallet sudah terhubung
    if (status === "authenticated" && isConnected && walletAddress) {
      // Bandingkan alamat di sesi NextAuth dengan alamat aktif di wallet
      if (session.user.address.toLowerCase() !== walletAddress.toLowerCase()) {
        console.warn(
          "Ketidakcocokan alamat terdeteksi! Sesi lama sedang di-logout."
        );
        toast.info("Akun wallet Anda telah berubah.", {
          description:
            "Sesi Anda telah diakhiri untuk keamanan. Silakan masuk kembali.",
        });
        // Secara paksa logout sesi NextAuth yang lama
        signOut({ redirect: true, callbackUrl: "/login" });
      }
    }
  }, [status, isConnected, walletAddress, session]); // Jalankan efek ini setiap kali ada perubahan

  return null; // Komponen ini tidak me-render UI apa pun
}

export function Web3Provider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={resolvedTheme === "dark" ? darkTheme() : lightTheme()}
        >
          <WalletSessionManager />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// PERBAIKAN UTAMA: Buat komponen wrapper baru ini
// Ini akan menjadi pembungkus terluar di file providers.tsx
export function RootWeb3Provider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* Web3Provider sekarang berada DI DALAM ThemeProvider */}
      <Web3Provider initialState={initialState}>{children}</Web3Provider>
    </ThemeProvider>
  );
}
