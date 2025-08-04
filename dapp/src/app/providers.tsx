"use client";

import { SessionProvider } from "next-auth/react";
import { RootWeb3Provider } from "@/lib/walletProviders/wallet";
import { type State } from "wagmi";
import { WebSocketProvider } from "@/components/auth/WebSocketProvider";

export default function Providers({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: State;
}) {
  return (
    <SessionProvider>
      <RootWeb3Provider initialState={initialState}>
        {children}
        {/* Pasang WebSocketProvider di sini agar selalu aktif */}
        <WebSocketProvider />
      </RootWeb3Provider>
    </SessionProvider>
  );
}
