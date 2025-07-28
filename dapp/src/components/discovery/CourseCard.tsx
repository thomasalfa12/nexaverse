"use client";

import type { TemplateWithStats } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, User } from "lucide-react";

const toGatewayURL = (ipfsUri: string) => {
  if (ipfsUri && ipfsUri.startsWith("ipfs://"))
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  return ipfsUri;
};

export function CourseCard({ template }: { template: TemplateWithStats }) {
  const isCourse =
    Array.isArray(template.modules) && template.modules.length > 0;

  return (
    // Wrapper div ini akan menjadi target dari komponen <Link>
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-background transition-all hover:shadow-xl h-full">
      <div className="aspect-[16/9] bg-muted overflow-hidden relative">
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
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <Badge variant={isCourse ? "default" : "secondary"}>
            {isCourse ? "Kursus" : "Kredensial"}
          </Badge>
          <h3
            className="mt-2 text-lg font-semibold leading-tight"
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
              <span>{template.modules?.length} Modul</span>
            </div>
          )}
          {/* Tombol ini sekarang hanya untuk visual, karena seluruh kartu bisa diklik */}
          <Button size="sm" className="w-full mt-2" tabIndex={-1}>
            Lihat Detail
          </Button>
        </div>
      </div>
    </div>
  );
}
