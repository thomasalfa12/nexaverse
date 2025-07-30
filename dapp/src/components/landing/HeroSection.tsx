// components/landing/HeroSection.tsx
"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
// FIX: Ganti TextGenerateEffect dengan TypewriterEffect
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import type { GlobeConfig } from "@/components/ui/globe"; // Import tipe dari file baru

// Lakukan dynamic import pada komponen NewGlobe yang telah dibuat
const World = dynamic(
  () => import("@/components/ui/globe").then((m) => m.World),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center bg-primary/5">
          <p className="text-primary/50">Loading Globe...</p>
        </div>
      </div>
    ),
  }
);

export function HeroSection() {
  // Konfigurasi globe menjadi lebih sederhana
  const globeConfig: GlobeConfig = {
    showAtmosphere: true,
    atmosphereColor: "#ffffff",
    atmosphereAltitude: 0.1,
    arcTime: 1000,
    arcLength: 0.9,
    autoRotateSpeed: 0.9,
  };

  // Data arcs tetap sama
  const sampleArcs = [
    {
      order: 1,
      startLat: -6.2,
      startLng: 106.84,
      endLat: 48.85,
      endLng: 2.35,
      arcAlt: 0.5,
      color: "#9333ea",
    },
    {
      order: 2,
      startLat: -6.2,
      startLng: 106.84,
      endLat: 35.67,
      endLng: 139.65,
      arcAlt: 0.3,
      color: "#d946ef",
    },
    {
      order: 3,
      startLat: 1.35,
      startLng: 103.81,
      endLat: 51.5,
      endLng: -0.12,
      arcAlt: 0.5,
      color: "#f472b6",
    },
  ];

  // FIX: Siapkan data untuk TypewriterEffect
  const words = [
    { text: "Your" },
    { text: "Reputation." },
    { text: "Immortalized.", className: "text-primary dark:text-primary" },
  ];

  return (
    <section className="relative w-full h-[100vh] md:h-[110vh] flex flex-col items-center justify-center text-center overflow-hidden bg-background">
      {/* Grid background */}
      <div className="absolute inset-0 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] z-0" />
      {/* Gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent z-10" />

      <div className="relative z-20 flex flex-col items-center px-4 -mt-20 md:-mt-32">
        {/* FIX: Ganti komponen dengan TypewriterEffect */}
        <TypewriterEffect
          words={words}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.5, ease: [0.22, 1, 0.36, 1] }} // Delay disesuaikan dengan animasi typewriter
          className="mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground"
        >
          Nexaverse is the on-chain learning and credentialing platform. Turn
          your expertise into verifiable digital assets and build your
          reputation in the new digital economy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.7, ease: [0.22, 1, 0.36, 1] }} // Delay disesuaikan
          className="mt-10 flex items-center gap-4"
        >
          <ShimmerButton>
            Start Creating
            <ArrowRight className="ml-2 h-5 w-5" />
          </ShimmerButton>
        </motion.div>
      </div>

      {/* Kontainer untuk Globe */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="absolute bottom-[-150px] md:bottom[-200px] w-full h-[600px] z-0 opacity-40 md:opacity-100"
      >
        <World globeConfig={globeConfig} data={sampleArcs} />
      </motion.div>
    </section>
  );
}
