"use client";
import { Web3Provider } from "@/lib/walletProviders/wallet";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <Web3Provider>{children}</Web3Provider>;
}
