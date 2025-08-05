"use client";

import React, { useState, useEffect, ReactNode } from "react";
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
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";

// --- Singleton Pattern untuk Wagmi Config ---
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

// --- Singleton Pattern untuk QueryClient ---
let queryClientInstance: QueryClient | null = null;
const getQueryClient = () => {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 10, // 10 minutes
        },
      },
    });
  }
  return queryClientInstance;
};

export const queryClient = getQueryClient();

// --- WalletSessionManager ---
function WalletSessionManager() {
  const { data: session, status } = useSession();
  const { address: walletAddress, isConnected } = useAccount();
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (
      status === "loading" ||
      isValidating ||
      !isConnected ||
      !walletAddress
    ) {
      return;
    }

    if (
      status === "authenticated" &&
      session?.user?.address &&
      session.user.address.toLowerCase() !== walletAddress.toLowerCase()
    ) {
      setIsValidating(true);
      const timeoutId = setTimeout(() => {
        toast.warning("Akun Wallet Berubah", {
          description:
            "Sesi Anda akan diakhiri untuk keamanan. Silakan masuk kembali.",
        });
        signOut({ redirect: true, callbackUrl: "/login" });
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [
    status,
    isConnected,
    walletAddress,
    session?.user?.address,
    isValidating,
  ]);

  return null;
}

// --- Client-Side RainbowKit Provider ---
function ClientOnlyRainbowKit({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <RainbowKitProvider
      theme={resolvedTheme === "dark" ? darkTheme() : lightTheme()}
    >
      {children}
    </RainbowKitProvider>
  );
}

// --- Web3Provider yang Bersih (Tanpa ThemeProvider) ---
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
        <ClientOnlyRainbowKit>
          <WalletSessionManager />
          {children}
        </ClientOnlyRainbowKit>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
