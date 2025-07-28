"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Loader2, Search, XCircle } from "lucide-react";
import type { TemplateWithStats } from "@/types";
import { CourseCard } from "@/components/discovery/CourseCard";
import { Input } from "@/components/ui/input";
import Link from "next/link"; // FIX: Impor komponen Link

export default function DiscoveryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<TemplateWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/community/discovery");
        if (!res.ok) throw new Error("Gagal memuat data kursus.");
        setCourses(await res.json());
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    if (!searchTerm) return courses;
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.creator.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }

    if (filteredCourses.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            // FIX: Membungkus setiap kartu dengan komponen Link ke halaman detail kursus
            <Link
              href={`/courses/${course.id}`}
              key={course.id}
              className="h-full"
            >
              <CourseCard template={course} />
            </Link>
          ))}
        </div>
      );
    }

    if (searchTerm && filteredCourses.length === 0) {
      return (
        <div className="text-center py-16">
          <XCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">Tidak Ditemukan</h3>
          <p className="mt-2 text-muted-foreground">
            Coba gunakan kata kunci lain.
          </p>
        </div>
      );
    }

    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold">Belum Ada Kursus</h3>
        <p className="mt-2 text-muted-foreground">
          Saat kreator mempublikasikan kursus, kursus akan muncul di sini.
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Jelajahi Kursus
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Temukan kursus dari para kreator terbaik untuk meningkatkan keahlian
          Anda di dunia Web3.
        </p>
      </div>
      <div className="mb-8 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari kursus atau kreator..."
            className="w-full pl-10 h-12 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {renderContent()}
    </div>
  );
}
