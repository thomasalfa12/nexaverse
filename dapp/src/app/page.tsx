// src/app/page.tsx
"use client";

// PERBAIKAN: Menambahkan useState ke dalam impor React
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSiweLogin } from "@/lib/walletProviders/useSiweLogin";
import { useSocialWallet } from "@/lib/walletProviders/useSocialWallet";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

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
import {
  Chrome,
  Loader2,
  LogIn,
  ShieldCheck,
  Star,
  KeyRound,
} from "lucide-react";
import DarkModeToggle from "@/components/ui/DarkModeToggle";

// Komponen baru untuk animasi 3D di sisi kiri
const InteractiveHero = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene setup
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

    camera.position.z = 5;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x87ceeb, 2, 100); // Sky blue light
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // Central Identity Core
    const coreGeometry = new THREE.IcosahedronGeometry(0.5, 1);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x0077ff,
      emissive: 0x0077ff,
      emissiveIntensity: 1,
      metalness: 0.5,
      roughness: 0.4,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Orbiting Credential Cards
    const cards: THREE.Mesh[] = [];
    const cardCount = 8;
    const cardGeometry = new THREE.BoxGeometry(1, 0.6, 0.05);
    for (let i = 0; i < cardCount; i++) {
      const cardMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.8,
        roughness: 0.2,
        side: THREE.DoubleSide,
      });
      const card = new THREE.Mesh(cardGeometry, cardMaterial);
      const angle = (i / cardCount) * Math.PI * 2;
      const radius = 2.5;
      card.position.x = Math.cos(angle) * radius;
      card.position.y = Math.sin(angle) * radius;
      card.lookAt(core.position);
      scene.add(card);
      cards.push(card);
    }

    // Starfield
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 5000;
    const posArray = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
    starsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0xffffff,
    });
    const starMesh = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starMesh);

    // Mouse move interaction
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      core.rotation.y += 0.005;
      core.rotation.x += 0.002;

      cards.forEach((card, i) => {
        const angle = (i / cardCount) * Math.PI * 2 + Date.now() * 0.0002;
        const radius = 2.5;
        card.position.x = Math.cos(angle) * radius;
        card.position.z = Math.sin(angle) * radius;
        card.lookAt(core.position);
      });

      // Parallax effect
      camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="h-full w-full" />;
};

// Komponen baru untuk animasi teks fitur
const FeatureCarousel = () => {
  const features = [
    { text: "Kelola Kredensial Digital Anda", icon: Star },
    { text: "Amankan Identitas On-Chain Anda", icon: ShieldCheck },
    { text: "Buka Akses Eksklusif", icon: KeyRound },
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // PERBAIKAN: Menambahkan tipe 'number' pada parameter
      setIndex((prevIndex: number) => (prevIndex + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [features.length]);

  const CurrentIcon = features[index].icon;

  return (
    <div className="relative z-10 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 mx-auto">
        <CurrentIcon className="h-8 w-8 text-blue-400" />
      </div>
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
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

export default function Home() {
  // --- SEMUA LOGIKA HOOKS ANDA TETAP SAMA ---
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
    <main className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      {/* LEFT – Hero Section (REDESIGNED) */}
      <section className="relative hidden flex-col items-center justify-center bg-black p-10 text-white lg:flex">
        <div className="absolute inset-0 z-0">
          <InteractiveHero />
        </div>
        <FeatureCarousel />
      </section>

      {/* RIGHT – Auth Section (UNCHANGED) */}
      <section className="relative flex items-center justify-center bg-gray-50 p-6 dark:bg-black">
        <div className="absolute right-6 top-6">
          <DarkModeToggle />
        </div>
        <Card className="w-full max-w-sm border-none bg-transparent shadow-none md:border md:bg-card md:shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Selamat Datang</CardTitle>
            <CardDescription>Masuk ke Nexaverse untuk memulai.</CardDescription>
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
                <span className="bg-card px-2 text-muted-foreground">
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
