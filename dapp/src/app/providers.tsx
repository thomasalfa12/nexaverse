// app/providers.tsx

"use client";

import { SessionProvider } from "next-auth/react";
// Ganti impor dari Web3Provider menjadi RootWeb3Provider
import { RootWeb3Provider } from "@/lib/walletProviders/wallet";
import { type State } from "wagmi";

export default function Providers({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: State;
}) {
  return (
    <SessionProvider>
      {/* Gunakan RootWeb3Provider di sini */}
      <RootWeb3Provider initialState={initialState}>
        {children}
      </RootWeb3Provider>
    </SessionProvider>
  );
}
