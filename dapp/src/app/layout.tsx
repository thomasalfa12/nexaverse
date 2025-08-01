// src/app/layout.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

import { wagmiConfig } from "@/lib/walletProviders/wallet";
import Providers from "./providers";
import "./globals.css";

// HAPUS: Import AuthProvider yang sudah tidak terpakai
// import { AuthProvider } from "@/components/auth/AuthProviders";

export const metadata: Metadata = {
  title: "Nexaverse App",
  description: "Aplikasi Web3 yang dibangun dengan benar",
};

// FIX: Tambahkan 'async' ke fungsi RootLayout
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // FIX: Tambahkan 'await' sebelum memanggil headers()
  const cookie = (await headers()).get("cookie");
  const initialState = cookieToInitialState(wagmiConfig, cookie);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Kode ini sudah benar */}
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
