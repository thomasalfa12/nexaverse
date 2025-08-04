"use client";

import React, { useState, useEffect, ReactNode, useRef } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  getDefaultConfig,
  lightTheme,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, type State, useAccount, type Config } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";

// --- Pola Singleton untuk Wagmi Config (Sudah Benar) ---
let wagmiConfigInstance: Config | null = null;
const getWagmiConfig = () => {
  if (!wagmiConfigInstance) {
    wagmiConfigInstance = getDefaultConfig({
      appName: "Nexaverse",
      projectId: process.env.NEXT_PUBLIC_WCT_PROJECT_ID!,
      chains: [baseSepolia],
      ssr: true,
    });
  }
  return wagmiConfigInstance;
};

export const wagmiConfig = getWagmiConfig();

const queryClient = new QueryClient();

// --- WalletSessionManager yang Disempurnakan ---
// Updated WalletSessionManager
function WalletSessionManager() {
  const { data: session, status } = useSession();
  const { address: walletAddress, isConnected } = useAccount();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Kondisi 1: Pastikan semua data sudah siap
    if (
      status !== "authenticated" ||
      !isConnected ||
      !walletAddress ||
      !session?.user?.address
    ) {
      return;
    }

    // Kondisi 2: Periksa ketidakcocokan
    const sessionAddress = session.user.address.toLowerCase();
    const connectedAddress = walletAddress.toLowerCase();

    if (sessionAddress !== connectedAddress) {
      // Gunakan timeout untuk mencegah logout yang terlalu cepat saat ganti jaringan
      timeoutRef.current = setTimeout(() => {
        console.warn(
          "Ketidakcocokan alamat terdeteksi! Sesi lama sedang di-logout.",
          {
            session: sessionAddress,
            wallet: connectedAddress,
          }
        );

        toast.warning("Akun Wallet Berubah", {
          description:
            "Sesi Anda telah diakhiri untuk keamanan. Silakan masuk kembali.",
        });

        signOut({ redirect: true, callbackUrl: "/login" });
      }, 1000); // Jeda 1 detik untuk stabilitas
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [status, isConnected, walletAddress, session?.user?.address]); // Dependency yang lebih spesifik

  return null;
}

function ThemedRainbowKitProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <RainbowKitProvider
      theme={resolvedTheme === "dark" ? darkTheme() : lightTheme()}
    >
      {children}
    </RainbowKitProvider>
  );
}

export function Web3Provider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ThemedRainbowKitProvider>
          <WalletSessionManager />
          {children}
        </ThemedRainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

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
      <Web3Provider initialState={initialState}>{children}</Web3Provider>
    </ThemeProvider>
  );
}
