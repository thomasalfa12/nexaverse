"use client";
import React from "react";
// Impor komponen UI Timeline dari file yang sudah Anda siapkan
import { Timeline } from "@/components/ui/timeline";

// Data untuk Roadmap Proyek, diformat agar sesuai dengan props komponen Timeline
const timelineData = [
  {
    title: "Phase 1",
    content: (
      <div className="text-left p-4 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-neutral-800 transition-all duration-200">
        <span className="inline-block bg-primary text-primary-foreground rounded-full text-xs font-semibold px-3 py-1 mb-4">
          Now: Q3 2025
        </span>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Building the Foundation (LMS 2.5)
        </h3>
        <p className="text-muted-foreground text-sm md:text-base">
          Our current focus is on perfecting the core learning management
          system. We are building a robust, scalable, and user-friendly platform
          that combines the best of Web2 usability with the foundational
          principles of Web3 ownership.
        </p>
      </div>
    ),
  },
  {
    title: "Phase 2",
    content: (
      <div className="text-left p-4 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-neutral-800 transition-all duration-200">
        <span className="inline-block bg-primary text-primary-foreground rounded-full text-xs font-semibold px-3 py-1 mb-4">
          Next: Q1 2026
        </span>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Full Web3 Integration
        </h3>
        <p className="text-muted-foreground text-sm md:text-base">
          Moving forward, we will deepen our on-chain integration. This includes
          a fully decentralized content delivery network, enhanced smart
          contract functionalities for creators, and token-gated communities,
          creating a true learn-to-earn ecosystem.
        </p>
      </div>
    ),
  },
  {
    title: "Phase 3",
    content: (
      <div className="text-left p-4 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-neutral-800 transition-all duration-200">
        <span className="inline-block bg-primary text-primary-foreground rounded-full text-xs font-semibold px-3 py-1 mb-4">
          Future: Q3 2026
        </span>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          The Social Reputation Layer
        </h3>
        <p className="text-muted-foreground text-sm md:text-base">
          {/* FIX: Mengganti tanda kutip ganda dengan tunggal untuk menghindari error lint */}
          The ultimate vision for Nexaverse is to build a &apos;Decentralized
          Society&apos; powered by Soulbound Tokens. We will introduce SocialFi
          features where your SBTs are not just credentials, but keys to a new
          social graph. Connect, collaborate, and build trust based on
          verifiable on-chain reputation.
        </p>
      </div>
    ),
  },
];

// FIX: Mengganti nama fungsi untuk menghindari konflik impor
export function ProjectTimeline() {
  return (
    <section id="timeline" className="bg-background">
      <div className="container mx-auto text-center mb-10 md:mb-20">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          The Nexaverse Roadmap
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Our vision for building the future of decentralized reputation and
          education.
        </p>
      </div>
      {/* Memanggil komponen UI Timeline dengan data roadmap */}
      <Timeline data={timelineData} />
    </section>
  );
}
