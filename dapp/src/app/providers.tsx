"use client";

import { SessionProvider } from "next-auth/react";
import { Web3Provider } from "@/lib/walletProviders/wallet";
import { type State } from "wagmi";

export default function Providers({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: State;
}) {
  return (
    // Bungkus semua dengan SessionProvider
    <SessionProvider>
      <Web3Provider initialState={initialState}>{children}</Web3Provider>
    </SessionProvider>
  );
}
