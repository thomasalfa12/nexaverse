// src/components/discovery/CourseCard.tsx

"use client";

// FIX 1: Ganti tipe yang diimpor dari TemplateWithStats menjadi CourseWithStats
import type { CourseWithStats } from "@/types";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Layers, User, ArrowRight } from "lucide-react";

const toGatewayURL = (ipfsUri: string) => {
  if (ipfsUri && ipfsUri.startsWith("ipfs://"))
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  return ipfsUri;
};

// FIX 2: Ganti nama dan tipe prop dari 'template' menjadi 'course'
export function CourseCard({ course }: { course: CourseWithStats }) {
  // FIX 3: Logika disederhanakan. Komponen ini sekarang selalu untuk "Kursus".
  // Kita hanya perlu cek apakah ada modul untuk ditampilkan.
  const hasModules = course.modules?.length > 0;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-background shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          // FIX 4: Gunakan properti dari 'course'
          src={toGatewayURL(course.imageUrl)}
          alt={course.title}
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

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {/* Badge sekarang statis karena ini adalah kartu untuk kursus */}
          <Badge variant="default">Kursus</Badge>

          <h3
            className="mt-3 text-lg font-semibold leading-tight text-foreground line-clamp-2"
            title={course.title}
          >
            {course.title}
          </h3>

          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{course.creator?.name || "Creator Tanpa Nama"}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          {/* Tampilkan jumlah modul jika ada */}
          {hasModules && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>{course.modules?.length} Modul</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-primary font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100 ml-auto">
            <span>Lihat</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
