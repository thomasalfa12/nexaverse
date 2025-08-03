"use client";
import type { CourseWithStats } from "@/types"; // 1. Gunakan tipe yang benar
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen } from "lucide-react";

export function CourseHeader({ course }: { course: CourseWithStats }) {
  return (
    <div className="bg-muted border-b">
      <div className="container mx-auto px-4 py-12">
        <Badge>{course.category || "General"}</Badge>
        <h1 className="text-4xl lg:text-5xl font-bold mt-4">{course.title}</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
          {course.description}
        </p>
        <div className="flex flex-wrap items-center gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="font-semibold">Dibuat oleh:</div>
            {/* 2. Akses nama kreator dengan aman */}
            <div className="text-muted-foreground">
              {course.creator?.name || "Kreator Anonim"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="font-semibold">
              {course.modules?.length || 0} Modul
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-semibold">
              {course._count?.enrollments || 0} Siswa
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
