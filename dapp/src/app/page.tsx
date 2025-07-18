// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Menggunakan Next/Image untuk optimasi
import { useSiweLogin } from "@/lib/useSiweLogin";
import { useSocialWallet } from "@/lib/useSocialWallet";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Shadcn UI & Icons
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Chrome, Loader2, LogIn } from "lucide-react"; // Ikon baru

// Komponen DarkModeToggle tetap sama
import DarkModeToggle from "@/components/ui/DarkModeToggle";

export default function Home() {
  /* ---------- auth hooks ---------- */
  const router = useRouter();
  const { login: signAndContinue, loading: siweLoading } = useSiweLogin();
  const {
    ready,
    isLoggedIn,
    login: socialLogin,
    loading: socialLoading,
  } = useSocialWallet();

  /* ---------- redirect logic ---------- */
  useEffect(() => {
    // Redirect jika sudah login (baik via wallet atau social)
    if (ready && isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [ready, isLoggedIn, router]);

  /* ---------- UI ---------- */
  return (
    <main className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      {/* LEFT – Hero Section */}
      <section className="relative hidden items-end bg-zinc-900 p-10 text-white lg:flex">
        <div className="absolute inset-0">
          {/* Anda bisa mengganti ini dengan gambar latar yang lebih menarik */}
          {/* Contoh: <Image src="/path-to-your-image.jpg" alt="Blockchain illustration" layout="fill" objectFit="cover" /> */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        </div>
        <div className="relative z-10">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="h-9 w-9"
            >
              <path d="M3 16.5A4.5 4.5 0 017.5 12h9a4.5 4.5 0 110 9h-9A4.5 4.5 0 013 16.5z" />
              <path d="M9 7.5A4.5 4.5 0 0113.5 3h1A4.5 4.5 0 0119 7.5v.25a.75.75 0 01-.75.75H9.75A.75.75 0 019 7.75v-.25z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold">Nexa Identity</h1>
          <p className="mt-2 text-lg text-zinc-300">
            The decentralized hub to manage your Web3 credentials securely.
          </p>
        </div>
      </section>

      {/* RIGHT – Auth Section */}
      <section className="relative flex items-center justify-center bg-gray-50 p-6 dark:bg-black">
        <div className="absolute right-6 top-6">
          <DarkModeToggle />
        </div>

        <Card className="w-full max-w-sm border-none bg-transparent shadow-none md:border md:bg-card md:shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Choose your preferred method to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {/* Social login (Google/Web3Auth) */}
            {ready && (
              <Button
                variant="outline"
                onClick={() => socialLogin()} // Asumsi fungsi login social ada di hook
                disabled={socialLoading}
              >
                {socialLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Chrome className="mr-2 h-4 w-4" /> // Ikon Google Chrome
                )}
                Continue with Google
              </Button>
            )}

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Wallet connect + SIWE */}
            <ConnectButton.Custom>
              {({ account, openConnectModal, mounted }) => {
                if (!mounted) return null;

                // Wallet is connected -> Show Sign & Continue button
                if (account) {
                  return (
                    <Button
                      onClick={signAndContinue}
                      disabled={siweLoading}
                      className="w-full"
                    >
                      {siweLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogIn className="mr-2 h-4 w-4" />
                      )}
                      Sign & Continue
                    </Button>
                  );
                }

                // Wallet not connected -> Show Connect Wallet button
                return (
                  <Button onClick={openConnectModal} className="w-full">
                    Connect Wallet
                  </Button>
                );
              }}
            </ConnectButton.Custom>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
