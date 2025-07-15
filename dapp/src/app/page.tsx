// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSiweLogin } from "@/lib/useSiweLogin"; // ⬅️ SIWE hook
import { useSocialWallet } from "@/lib/useSocialWallet"; // ⬅️ Google/Web3Auth
import { ConnectButton } from "@rainbow-me/rainbowkit";
import SocialLoginButton from "@/components/SocialLoginButton";
import DarkModeToggle from "@/components/DarkModeToggle";

export default function Home() {
  /* ---------- auth hooks ---------- */
  const router = useRouter();
  const { login: signAndContinue, loading } = useSiweLogin(); // wallet flow
  const { ready, isLoggedIn } = useSocialWallet(); // google flow

  /* ---------- redirect untuk Google ---------- */
  useEffect(() => {
    if (ready && isLoggedIn) router.replace("/dashboard");
  }, [ready, isLoggedIn, router]);

  /* ---------- UI ---------- */
  return (
    <main className="grid min-h-screen w-full grid-cols-1 md:grid-cols-2 dark:bg-zinc-900">
      {/* LEFT – Hero */}
      <section className="flex items-center justify-center bg-gradient-to-br from-sky-200 to-white p-8 dark:from-zinc-800 dark:to-zinc-900">
        <div className="max-w-md rounded-3xl bg-white px-12 py-14 text-center shadow-lg dark:bg-zinc-800 dark:text-gray-100">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600">
            {/* cloud icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="h-10 w-10"
            >
              <path d="M3 16.5A4.5 4.5 0 017.5 12h9a4.5 4.5 0 110 9h-9A4.5 4.5 0 013 16.5z" />
              <path d="M9 7.5A4.5 4.5 0 0113.5 3h1A4.5 4.5 0 0119 7.5v.25a.75.75 0 01-.75.75H9.75A.75.75 0 019 7.75v-.25z" />
            </svg>
          </div>

          <h1 className="mb-2 text-3xl font-bold">Nexa Identity</h1>
          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
            The decentralized hub to manage your Web3 credentials securely.
          </p>

          <ul className="space-y-3 text-left text-sm text-gray-800 dark:text-gray-300">
            {[
              "Manage soul‑bound tokens and verifiable credentials",
              "Verify institutions and individual users",
              "Seamless connection to Base Sepolia wallets",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 text-green-600">✅</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* RIGHT – Auth */}
      <section className="relative flex items-center justify-center bg-gray-50 p-8 dark:bg-zinc-900">
        {/* Dark‑mode toggle */}
        <DarkModeToggle className="absolute right-6 top-6" />

        <div className="w-full max-w-sm space-y-4">
          {/* Social login (Google/Web3Auth) */}
          {ready && <SocialLoginButton />}

          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            or
          </div>

          {/* Wallet connect + SIWE */}
          <ConnectButton.Custom>
            {({ account, openConnectModal, mounted }) => {
              if (!mounted) return null;

              /* Wallet sudah connect – tampilkan tombol Sign & Continue */
              if (account) {
                return (
                  <button
                    onClick={signAndContinue}
                    disabled={loading}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-60"
                  >
                    {loading ? "Signing…" : "Sign & Continue"}
                  </button>
                );
              }

              /* Wallet belum connect – tombol Connect Wallet */
              return (
                <button
                  onClick={openConnectModal}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow hover:bg-blue-700"
                >
                  Connect Wallet
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </section>
    </main>
  );
}
