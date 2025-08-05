"use client";

import { useEffect, useState, lazy, Suspense } from "react";
// ✨ Import utilities optimisasi
import {
  prefetchRoute,
  shouldLoadHighQuality,
  getConnectionInfo,
} from "@/utils/lazyLoading";
import PerformanceWidget from "@/components/login/PerformanceWidget";
import { useAccount, useSignMessage } from "wagmi";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import { useRouter } from "next/navigation";
import { ConnectButton, RainbowKitProvider } from "@rainbow-me/rainbowkit";

// UI & Animasi
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DarkModeToggle from "@/components/ui/dark-mode-toggle";
import { LogIn, Loader2, ShieldCheck, PenTool, Users } from "lucide-react";
import { toast } from "sonner";

// Provider
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig, queryClient } from "@/lib/walletProviders/wallet";

// ✨ OPTIMISASI 1: Lazy Loading untuk Komponen Berat
const InteractiveHero = lazy(
  () => import("@/components/login/InteractiveHero")
);

// ============================================================================
// --- Komponen Loading Fallback untuk Three.js ---
// ============================================================================
const HeroLoadingFallback = () => (
  <div className="absolute inset-0 z-0 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="text-sm text-gray-400">Memuat visualisasi...</p>
    </div>
  </div>
);

// ============================================================================
// --- Komponen Carousel Fitur ---
// ============================================================================
const FeatureCarousel = () => {
  const fitur = [
    { text: "Ciptakan Warisan Digital Anda", icon: PenTool },
    { text: "Verifikasi Kreasi Unik Anda", icon: ShieldCheck },
    { text: "Libatkan Komunitas Anda", icon: Users },
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % fitur.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [fitur.length]);

  const IconSaatIni = fitur[index].icon;

  return (
    <div className="relative z-10 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mx-auto shadow-lg">
        <IconSaatIni className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
        Nexaverse
      </h1>
      <div className="mt-4 h-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
            className="text-lg text-zinc-300"
          >
            {fitur[index].text}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================================================
// --- Komponen Inti Halaman Login ---
// ============================================================================
function KontenHalamanLogin() {
  const router = useRouter();
  const { status } = useSession();
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [sedangMemuat, setSedangMemuat] = useState(false);

  // ✨ OPTIMISASI 2: Preload Dashboard Route dengan Connection Awareness
  useEffect(() => {
    if (address && status === "unauthenticated") {
      const connectionInfo = getConnectionInfo();
      console.log("🌐 Info koneksi:", connectionInfo);

      // Hanya preload jika koneksi bagus
      if (shouldLoadHighQuality()) {
        console.log("🚀 Preloading dashboard route...");
        router.prefetch("/dashboard");

        // Prefetch assets penting lainnya
        prefetchRoute("/api/user/profile", "high");
        prefetchRoute("/dashboard/assets", "low");
      } else {
        console.log("⚠️ Koneksi lambat, skip preloading");
      }
    }
  }, [address, status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const handleLoginSiwe = async () => {
    if (!address || !chainId) return;
    setSedangMemuat(true);

    try {
      const nonce = await getCsrfToken();
      if (!nonce) throw new Error("Gagal mendapatkan token keamanan (nonce).");

      const pesan = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Masuk dengan Ethereum ke Nexaverse.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });

      const tandaTangan = await signMessageAsync({
        message: pesan.prepareMessage(),
      });

      const hasil = await signIn("credentials", {
        message: JSON.stringify(pesan),
        signature: tandaTangan,
        redirect: false,
      });

      if (hasil?.error) {
        throw new Error("Login ditolak atau terjadi kesalahan.");
      }

      // ✨ OPTIMISASI: Dashboard sudah di-preload, jadi navigasi lebih cepat
      router.push("/dashboard");
    } catch (error) {
      toast.error("Login Gagal", {
        description: (error as Error).message,
      });
    } finally {
      setSedangMemuat(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-600">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* ✨ Widget Performance Monitor (hanya di development) */}
      <PerformanceWidget />

      {/* Bagian Hero dengan Three.js */}
      <section className="relative hidden basis-1/2 flex-col items-center justify-center bg-black p-10 text-white lg:flex overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900" />

        {/* ✨ OPTIMISASI: Lazy Loading dengan Suspense */}
        <Suspense fallback={<HeroLoadingFallback />}>
          <InteractiveHero />
        </Suspense>

        <FeatureCarousel />
      </section>

      {/* Bagian Form Login */}
      <section className="relative flex flex-1 flex-col items-center justify-center p-6 bg-slate-900 text-white lg:bg-transparent lg:text-foreground">
        <div className="absolute right-6 top-6">
          <DarkModeToggle />
        </div>

        {/* Carousel untuk mobile */}
        <div className="lg:hidden w-full pt-16 pb-12">
          <FeatureCarousel />
        </div>

        <Card className="w-full max-w-sm bg-card/60 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Selamat Datang Kembali</CardTitle>
            <CardDescription>
              Masuk ke Nexaverse untuk melanjutkan perjalanan Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card/60 px-2 text-muted-foreground backdrop-blur-xl">
                  Hubungkan dan Verifikasi
                </span>
              </div>
            </div>

            <ConnectButton.Custom>
              {({ account, openConnectModal, mounted }) => {
                if (!mounted)
                  return (
                    <div className="h-[40px] w-full animate-pulse rounded-md bg-muted" />
                  );

                if (account) {
                  return (
                    <Button
                      onClick={handleLoginSiwe}
                      disabled={sedangMemuat}
                      className="w-full transition-all duration-200 hover:scale-105"
                      size="lg"
                    >
                      {sedangMemuat ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogIn className="mr-2 h-4 w-4" />
                      )}
                      {sedangMemuat ? "Memverifikasi..." : "Masuk & Lanjutkan"}
                    </Button>
                  );
                }

                return (
                  <Button
                    onClick={openConnectModal}
                    className="w-full transition-all duration-200 hover:scale-105"
                    size="lg"
                  >
                    Hubungkan Wallet
                  </Button>
                );
              }}
            </ConnectButton.Custom>

            {/* Indikator status koneksi */}
            {address && (
              <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span>Wallet terhubung</span>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

// ============================================================================
// --- Wrapper Provider yang Dioptimalkan ---
// ============================================================================
export default function WrapperHalamanLogin() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <KontenHalamanLogin />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
