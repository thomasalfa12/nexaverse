"use client";

import React, { useEffect, useState } from "react";
import type { TemplateWithStats } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Layers, User, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const toGatewayURL = (ipfsUri: string) => {
  if (ipfsUri && ipfsUri.startsWith("ipfs://"))
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  return ipfsUri;
};

// --- Komponen Card Baru yang Didesain Ulang dengan Fokus pada Keanggunan ---
const FeaturedCourseCard = ({ template }: { template: TemplateWithStats }) => {
  const isCourse =
    Array.isArray(template.modules) && template.modules.length > 0;
  return (
    <Link
      href={`/courses/${template.id}`}
      className="block group w-full h-full"
    >
      <div className="flex flex-col h-full overflow-hidden rounded-2xl border bg-background transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
        {/* Gambar Kursus */}
        <div className="aspect-[16/9] w-full bg-muted overflow-hidden relative">
          <Image
            src={toGatewayURL(template.imageUrl)}
            alt={template.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = `https://placehold.co/600x400/EEE/31343C?text=Image+Error`;
            }}
          />
        </div>
        {/* Detail Konten */}
        <div className="flex flex-1 flex-col p-5 text-left">
          <div className="flex-1">
            <Badge variant={isCourse ? "default" : "secondary"}>
              {isCourse ? "Course" : "Credential"}
            </Badge>
            <h3
              className="mt-3 text-lg font-semibold leading-tight text-foreground"
              title={template.title}
            >
              {template.title}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{template.creator.name}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            {isCourse && (
              <div className="flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                <span>{template.modules?.length} Modules</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>View</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// --- Komponen Utama FeaturedCourses (dengan UI/UX baru) ---
export function FeaturedCourses() {
  const [courses, setCourses] = useState<TemplateWithStats[]>([]);

  useEffect(() => {
    async function getFeaturedCourses() {
      try {
        const res = await fetch(`/api/community/discovery`);
        if (!res.ok) return;
        const data: TemplateWithStats[] = await res.json();
        setCourses(data.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch featured courses:", error);
      }
    }
    getFeaturedCourses();
  }, []);

  return (
    <section className="px-4 bg-background dark:bg-dot-white/[0.1] relative">
      {/* Gradient di atas untuk efek fade */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-background to-transparent z-0" />

      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Featured Courses
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Start your journey with the most popular courses chosen by our
          community.
        </p>
      </div>

      {courses.length > 0 ? (
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 container mx-auto relative z-10">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeInOut" }}
              viewport={{ once: true, amount: 0.5 }}
              className="h-full"
            >
              <FeaturedCourseCard template={course} />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-gray-500">
          Featured courses will be available soon.
        </p>
      )}

      <div className="mt-16 text-center">
        <Button size="lg" asChild>
          <Link href="/dashboard">Explore All Courses</Link>
        </Button>
      </div>
    </section>
  );
}
