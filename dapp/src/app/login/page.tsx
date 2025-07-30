// src/app/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSiweLogin } from "@/lib/walletProviders/useSiweLogin";
import { useSocialWallet } from "@/lib/walletProviders/useSocialWallet";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import * as THREE from "three";
import { cn } from "@/lib/utils";
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
import DarkModeToggle from "@/components/ui/DarkModeToggle";

import {
  Chrome,
  Loader2,
  LogIn,
  ShieldCheck,
  PenTool,
  Users,
} from "lucide-react";

// ============================================================================
// --- KOMPONEN VISUAL (TIDAK BERUBAH) ---
// ============================================================================

const InteractiveHero = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);
    camera.position.z = 10;
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x444444);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);
    const particleCount = 2000;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x3b82f6,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
    });
    const particleMesh = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particleMesh);
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event: MouseEvent) => {
      const rect = currentMount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    currentMount.addEventListener("mousemove", handleMouseMove);
    const animate = () => {
      requestAnimationFrame(animate);
      const positions = particleMesh.geometry.attributes.position
        .array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] -= 0.01;
        if (positions[i] < -10) {
          positions[i] = 10;
        }
      }
      particleMesh.geometry.attributes.position.needsUpdate = true;
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
      camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    animate();
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      currentMount.removeEventListener("mousemove", handleMouseMove);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);
  return <div ref={mountRef} className="absolute inset-0 z-0 h-full w-full" />;
};

const FeatureCarousel = () => {
  const features = [
    { text: "Ciptakan Warisan Digital Anda", icon: PenTool },
    { text: "Verifikasi Kreasi Unik Anda", icon: ShieldCheck },
    { text: "Libatkan Komunitas Anda", icon: Users },
  ];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [features.length]);
  const CurrentIcon = features[index].icon;
  return (
    <div className="relative z-10 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mx-auto shadow-lg">
        <CurrentIcon className="h-8 w-8 text-white" />
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
            {features[index].text}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================================================
// --- KOMPONEN UTAMA (DIRESTRUKTURISASI UNTUK RESPONSIVE) ---
// ============================================================================
export default function Home() {
  const router = useRouter();
  const { login: signAndContinue, loading: siweLoading } = useSiweLogin();
  const {
    ready,
    isLoggedIn,
    login: socialLogin,
    loading: socialLoading,
  } = useSocialWallet();

  useEffect(() => {
    if (ready && isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [ready, isLoggedIn, router]);

  return (
    <main className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* KIRI – Hero Section (HANYA TAMPIL DI DESKTOP) */}
      <section className="relative hidden basis-1/2 flex-col items-center justify-center bg-black p-10 text-white lg:flex overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900" />
        <InteractiveHero />
        <FeatureCarousel />
      </section>

      {/* KANAN – Auth Section (TAMPIL DI SEMUA UKURAN LAYAR) */}
      <section
        className={cn(
          "relative flex flex-1 flex-col items-center justify-center p-6",
          // PERBAIKAN: Latar belakang gelap di mobile, dan transparan di desktop agar mewarisi warna dari body
          "bg-slate-900 text-white lg:bg-transparent lg:text-foreground"
        )}
      >
        <div className="absolute right-6 top-6">
          <DarkModeToggle />
        </div>

        <div className="lg:hidden w-full pt-16 pb-12">
          <FeatureCarousel />
        </div>

        <Card
          className={cn(
            "w-full max-w-sm",
            "border-none bg-transparent shadow-none lg:border lg:bg-card lg:shadow-lg"
          )}
        >
          <CardHeader className="text-center lg:text-left">
            <CardTitle className="text-2xl text-white lg:text-foreground">
              Selamat Datang
            </CardTitle>
            <CardDescription className="text-zinc-400 lg:text-muted-foreground">
              Masuk ke Nexaverse untuk memulai.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {ready && (
              <Button
                variant="outline"
                onClick={() => socialLogin()}
                disabled={socialLoading}
              >
                {socialLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Chrome className="mr-2 h-4 w-4" />
                )}
                Lanjutkan dengan Google
              </Button>
            )}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 lg:bg-card px-2 text-muted-foreground">
                  Atau lanjutkan dengan
                </span>
              </div>
            </div>
            <ConnectButton.Custom>
              {({ account, openConnectModal, mounted }) => {
                if (!mounted) return null;
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
                      Masuk & Lanjutkan
                    </Button>
                  );
                }
                return (
                  <Button onClick={openConnectModal} className="w-full">
                    Hubungkan Wallet
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
