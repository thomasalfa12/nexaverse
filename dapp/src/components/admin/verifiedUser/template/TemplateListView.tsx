"use client";

import { useState, useMemo } from "react";
import type { TemplateWithStats } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookText, Users, Tag, PlusCircle, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const toGatewayURL = (ipfsUri: string) => {
  if (ipfsUri && ipfsUri.startsWith("ipfs://"))
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  return ipfsUri;
};

// --- 1. Komponen Kartu yang Didesain Ulang untuk Admin ---
const AdminCourseCard = ({
  template,
  onSelect,
}: {
  template: TemplateWithStats;
  onSelect: () => void;
}) => (
  <div className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg">
    <div className="relative aspect-[16/9] overflow-hidden">
      <Image
        src={toGatewayURL(template.imageUrl)}
        alt={template.title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {/* Badge Status (Draft/Published) */}
      <Badge
        className="absolute top-2 right-2"
        variant={template.status === "PUBLISHED" ? "default" : "secondary"}
      >
        {template.status}
      </Badge>
    </div>
    <div className="flex flex-1 flex-col p-4">
      <h3
        className="flex-grow font-semibold leading-tight line-clamp-2"
        title={template.title}
      >
        {template.title}
      </h3>
      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
        {/* Metrik Baru: Jumlah Siswa */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 flex-shrink-0" />
          <span>{template._count?.enrollments || 0} Siswa Terdaftar</span>
        </div>
        {/* Metrik Baru: Kategori */}
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 flex-shrink-0" />
          <span>{template.category || "Tanpa Kategori"}</span>
        </div>
      </div>
    </div>
    <div className="border-t p-3">
      <Button variant="secondary" className="w-full" onClick={onSelect}>
        Kelola Kursus
      </Button>
    </div>
  </div>
);

// --- 2. Tampilan Daftar Utama dengan Tab Kategori ---
interface TemplateListViewProps {
  templates: TemplateWithStats[];
  onSelectTemplate: (template: TemplateWithStats) => void;
  emptyStateMessage: string;
  onCreateClick: () => void;
}

export function TemplateListView({
  templates,
  onSelectTemplate,
  emptyStateMessage,
  onCreateClick,
}: TemplateListViewProps) {
  // State untuk melacak kategori yang aktif
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  // Ekstrak kategori unik dari semua kursus
  const categories = useMemo(() => {
    const allCategories = templates
      .map((t) => t.category)
      .filter(Boolean) as string[];
    return ["Semua", ...Array.from(new Set(allCategories))];
  }, [templates]);

  // Filter kursus berdasarkan kategori yang dipilih
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "Semua") {
      return templates;
    }
    return templates.filter((t) => t.category === selectedCategory);
  }, [templates, selectedCategory]);

  // Tampilan jika tidak ada kursus sama sekali
  if (templates.length === 0) {
    return (
      <div className="text-center py-16 px-6 border-2 border-dashed rounded-xl mt-8">
        <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Anda Belum Punya Kursus</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {emptyStateMessage}
        </p>
        <Button onClick={onCreateClick} className="mt-6">
          <PlusCircle className="mr-2 h-4 w-4" />
          Buat Kursus Pertama Anda
        </Button>
      </div>
    );
  }

  // Tampilan utama dengan Tab dan Grid
  return (
    <div className="mt-4">
      {/* Navigasi Tab Kategori */}
      <div className="mb-6 border-b">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "shrink-0",
                selectedCategory === category
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid untuk menampilkan kursus yang sudah difilter */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <AdminCourseCard
              key={template.id}
              template={template}
              onSelect={() => onSelectTemplate(template)}
            />
          ))}
        </div>
      ) : (
        // Tampilan jika filter tidak menemukan hasil
        <div className="text-center py-16 px-6 bg-muted/40 rounded-xl">
          <BookText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Tidak Ada Kursus</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tidak ditemukan kursus dalam kategori &quot;{selectedCategory}
            &quot;.
          </p>
        </div>
      )}
    </div>
  );
}
