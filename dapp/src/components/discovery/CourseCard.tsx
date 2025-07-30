"use client";

import type { TemplateWithStats } from "@/types";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Layers, User, ArrowRight } from "lucide-react";

const toGatewayURL = (ipfsUri: string) => {
  if (ipfsUri && ipfsUri.startsWith("ipfs://"))
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  return ipfsUri;
};

export function CourseCard({ template }: { template: TemplateWithStats }) {
  const isCourse =
    Array.isArray(template.modules) && template.modules.length > 0;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-background shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
      {/* --- Bagian Gambar --- */}
      {/* ================================================================
        FIX: Tambahkan kelas 'relative' di sini. 
        Ini adalah perbaikan utamanya.
        ================================================================
      */}
      <div className="relative aspect-[16/9] overflow-hidden">
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

      {/* --- Bagian Konten --- */}
      <div className="flex flex-1 flex-col justify-between p-4">
        {/* Konten Utama (Atas) */}
        <div>
          <Badge variant={isCourse ? "default" : "secondary"}>
            {isCourse ? "Kursus" : "Kredensial"}
          </Badge>

          <h3
            className="mt-3 text-lg font-semibold leading-tight text-foreground line-clamp-2"
            title={template.title}
          >
            {template.title}
          </h3>

          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{template.creator?.name || "Creator Tanpa Nama"}</span>
          </div>
        </div>

        {/* Footer Kartu (Bawah) */}
        <div className="mt-4 flex items-center justify-between text-sm">
          {isCourse && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>{template.modules?.length} Modul</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-primary font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span>Lihat</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
