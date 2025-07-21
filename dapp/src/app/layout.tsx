// src/app/layout.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

import { wagmiConfig } from "@/lib/walletProviders/wallet";
import Providers from "./providers";
import "./globals.css";

// --- Impor AuthProvider yang baru dibuat ---
import { AuthProvider } from "@/components/auth/AuthProviders";

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
        {/* Bungkus Providers dengan AuthProvider */}
        <AuthProvider>
          <Providers initialState={initialState}>{children}</Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
