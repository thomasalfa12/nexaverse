// src/app/layout.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

import { wagmiConfig } from "@/lib/walletProviders/wallet";
import Providers from "./providers";
import "./globals.css";

// 1. Impor Toaster dari sonner
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Nexaverse App",
  description: "Aplikasi Web3 yang dibangun dengan benar",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = (await headers()).get("cookie");
  const initialState = cookieToInitialState(wagmiConfig, cookie);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers initialState={initialState}>{children}</Providers>
        {/* 2. Tambahkan komponen Toaster di sini, di luar Providers */}
        {/* Ini memastikan Toaster ada di level paling atas aplikasi Anda */}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
