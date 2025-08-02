// src/components/admin/verifiedUser/template/TemplateListView.tsx

"use client";

import { useState, useMemo } from "react";
import type { CourseWithStats } from "@/types";
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

const AdminCourseCard = ({
  course,
  onSelect,
}: {
  course: CourseWithStats;
  onSelect: () => void;
}) => (
  <div className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg">
    <div className="relative aspect-[16/9] overflow-hidden">
      <Image
        src={toGatewayURL(course.imageUrl)}
        alt={course.title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      <Badge
        className="absolute top-2 right-2"
        variant={course.status === "PUBLISHED" ? "default" : "secondary"}
      >
        {course.status}
      </Badge>
    </div>
    <div className="flex flex-1 flex-col p-4">
      <h3
        className="flex-grow font-semibold leading-tight line-clamp-2"
        title={course.title}
      >
        {course.title}
      </h3>
      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 flex-shrink-0" />
          <span>{course._count?.enrollments || 0} Siswa Terdaftar</span>
        </div>
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 flex-shrink-0" />
          <span>{course.category || "Tanpa Kategori"}</span>
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

interface CourseListViewProps {
  courses: CourseWithStats[];
  onSelectCourse: (course: CourseWithStats) => void;
  emptyStateMessage: string;
  onCreateClick: () => void;
}

export function TemplateListView({
  courses,
  onSelectCourse,
  emptyStateMessage,
  onCreateClick,
}: CourseListViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  const categories = useMemo(() => {
    // FIX 1: Tambahkan fallback `|| []` untuk mencegah error jika `courses` undefined.
    const allCategories = (courses || [])
      .map((c) => c.category)
      .filter(Boolean) as string[];
    return ["Semua", ...Array.from(new Set(allCategories))];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (selectedCategory === "Semua") {
      return courses;
    }
    // FIX 2: Tambahkan fallback `|| []` di sini juga untuk keamanan.
    return (courses || []).filter((c) => c.category === selectedCategory);
  }, [courses, selectedCategory]);

  // FIX 3: Tambahkan pengecekan `!courses` untuk menangani kondisi saat data belum siap.
  if (!courses || courses.length === 0) {
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

  return (
    <div className="mt-4">
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
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <AdminCourseCard
              key={course.id}
              course={course}
              onSelect={() => onSelectCourse(course)}
            />
          ))}
        </div>
      ) : (
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
