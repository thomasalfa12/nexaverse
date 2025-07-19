import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi"; // Import dari 'wagmi/ssr' setelah update

import { wagmiConfig } from "@/lib/walletProviders/wallet"; // Sesuaikan path import
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexaverse App",
  description: "Aplikasi Web3 yang dibangun dengan benar",
};

// Ubah fungsi menjadi async untuk menggunakan await
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Gunakan 'await' karena headers() mengembalikan Promise di versi Next.js Anda
  const cookie = (await headers()).get("cookie");

  // 2. Buat initialState menggunakan config dan cookie
  const initialState = cookieToInitialState(wagmiConfig, cookie);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* 3. Teruskan initialState ke komponen jembatan */}
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
