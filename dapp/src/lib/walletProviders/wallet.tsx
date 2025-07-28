"use client";

import React, { useState, useEffect } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  getDefaultConfig,
  lightTheme,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import AuthWatcher from "@/components/auth/authWatcher";
import { WagmiProvider, type State } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { ThemeProvider } from "@/components/ThemeProvider";

export const wagmiConfig = getDefaultConfig({
  appName: "Nexaverse",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  chains: [baseSepolia],
  ssr: true, // Pastikan ssr: true tetap ada
});

const queryClient = new QueryClient();

function ThemedRainbowKitProvider({ children }: { children: React.ReactNode }) {
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
  children: React.ReactNode;
  initialState?: State;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <WagmiProvider config={wagmiConfig} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
          <ThemedRainbowKitProvider>
            <AuthWatcher />
            {children}
          </ThemedRainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
