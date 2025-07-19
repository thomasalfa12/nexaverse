"use client";

import { Web3Provider } from "@/lib/walletProviders/wallet";
import { type State } from "wagmi";

export default function Providers({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: State;
}) {
  return <Web3Provider initialState={initialState}>{children}</Web3Provider>;
}