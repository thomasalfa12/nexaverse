"use client";
import React from "react";
import { DollarSign, Globe, Zap, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const features = [
  {
    value: "monetization",
    icon: <DollarSign className="h-6 w-6" />,
    title: "Direct Monetization",
    description:
      "Receive payments directly to your wallet. We only take a small, transparent platform fee, putting you in control of your earnings.",
  },
  {
    value: "reach",
    icon: <Globe className="h-6 w-6" />,
    title: "Global Reach",
    description:
      "Tap into an enthusiastic community of Web3 learners from around the globe, all hungry for new knowledge and skills.",
  },
  {
    value: "sovereignty",
    icon: <Zap className="h-6 w-6" />,
    title: "Full Sovereignty",
    description:
      "You own your smart contract. Your content, your community, and your data are yours—forever. Nexaverse provides the tools.",
  },
  {
    value: "tools",
    icon: <Edit className="h-6 w-6" />,
    title: "Intuitive Tools",
    description:
      "Effortlessly build curriculums, issue on-chain credentials, and manage your students through our streamlined creator dashboard.",
  },
];

export function ForCreators() {
  return (
    <section id="creators" className="bg-background relative overflow-hidden">
      {/* Subtle background grid */}
      <div className="absolute inset-0 bg-dot-black/[0.1] dark:bg-dot-white/[0.1] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] z-0" />

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Kolom Kiri: Teks dan CTA */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          viewport={{ once: true }}
          className="text-left"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Built for Creators
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Build your reputation. Share your expertise. Get rewarded. Nexaverse
            is the platform where experts like you thrive.
          </p>
          <Button
            size="lg"
            asChild
            className="mt-8 rounded-full px-8 py-7 text-base font-semibold group"
          >
            <Link href="/dashboard/verify">
              Start Teaching Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        {/* Kolom Kanan: Panel Fitur Interaktif */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          viewport={{ once: true }}
        >
          <Tabs defaultValue="monetization" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto bg-muted/50 p-2 rounded-2xl">
              {features.map((feature) => (
                <TabsTrigger
                  key={feature.value}
                  value={feature.value}
                  className="flex flex-col sm:flex-row gap-2 items-center p-3 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg"
                >
                  {feature.icon}
                  <span className="hidden sm:inline">{feature.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-4 relative min-h-[180px]">
              {features.map((feature) => (
                <TabsContent key={feature.value} value={feature.value} asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 bg-background rounded-2xl border text-left"
                  >
                    <h3 className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {feature.description}
                    </p>
                  </motion.div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}

// Helper component for the CTA button
const ArrowRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
  </svg>
);
