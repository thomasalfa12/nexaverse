"use client";

import React from "react";
import { motion } from "framer-motion";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import { UploadCloud, ShieldCheck, Share2, BrainCircuit } from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams"; // Latar belakang baru yang dinamis

// --- Komponen Visual untuk setiap Bento Box ---

const SkeletonOne = () => {
  const variants = {
    initial: { x: 0 },
    animate: { x: 10, rotate: 5, transition: { duration: 0.2 } },
  };
  const variantsSecond = {
    initial: { x: 0 },
    animate: { x: -10, rotate: -5, transition: { duration: 0.2 } },
  };
  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center space-x-2 bg-white dark:bg-black"
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />
        <div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center space-x-2 w-3/4 ml-auto bg-white dark:bg-black"
      >
        <div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />
      </motion.div>
    </motion.div>
  );
};

const SkeletonTwo = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 items-center justify-center">
      <ShieldCheck className="h-12 w-12 text-primary opacity-80" />
    </div>
  );
};

const SkeletonThree = () => {
  return (
    <div className="relative flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-dot-black/[0.2] dark:bg-dot-white/[0.2]">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent to-40%" />
      <Share2 className="absolute top-4 left-4 h-10 w-10 text-primary opacity-80" />
    </div>
  );
};

const SkeletonFour = () => {
  return (
    <div className="flex flex-col flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 items-center justify-center p-4">
      <BrainCircuit className="h-12 w-12 text-emerald-500 mb-4" />
      <p className="text-sm text-center text-emerald-800 dark:text-emerald-200 font-semibold">
        Inspired by Vitalik Buterin&apos;s vision, SBTs create a decentralized
        society...
      </p>
    </div>
  );
};

// --- Komponen Utama HowItWorks ---

export function HowItWorks() {
  const items = [
    {
      title: "1. Create Your Curriculum",
      description:
        "Design and upload your learning materials with our intuitive, powerful tools.",
      header: <SkeletonOne />,
      icon: <UploadCloud className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "2. Issue SBT Credentials",
      description:
        "Upon course completion, issue unique Soulbound Tokens as immutable, on-chain certificates.",
      header: <SkeletonTwo />,
      icon: <ShieldCheck className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "3. Build Your Community",
      description:
        "Engage with students and foster a vibrant learning environment.",
      header: <SkeletonThree />,
      icon: <Share2 className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "The Power of Soulbound Identity",
      description:
        "Your skills become a permanent, verifiable part of your digital soul.",
      header: <SkeletonFour />,
      icon: <BrainCircuit className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-4",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Setiap item akan muncul dengan jeda 0.2 detik
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <section
      id="how-it-works"
      className="relative px-4 bg-background overflow-hidden"
    >
      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          From Idea to Digital Legacy
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          A complete ecosystem for education in the new digital era.
        </p>
      </div>

      {/* Gunakan motion.div untuk animasi stagger */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative z-10"
      >
        <BentoGrid className="max-w-4xl mx-auto mt-16 md:auto-rows-[20rem]">
          {items.map((item, i) => (
            // FIX: Bungkus BentoGridItem dengan motion.div untuk menerapkan animasi
            <motion.div
              key={i}
              variants={itemVariants}
              className={cn(item.className)}
            >
              <BentoGridItem
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={"h-full [&>p:text-lg]"} // Hapus item.className dari sini
              />
            </motion.div>
          ))}
        </BentoGrid>
      </motion.div>

      {/* Latar belakang dinamis dari Aceternity UI */}
      <BackgroundBeams />
    </section>
  );
}
