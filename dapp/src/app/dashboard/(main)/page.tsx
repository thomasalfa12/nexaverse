// app/dashboard/(main)/page.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Search, XCircle } from "lucide-react";

// FIX 1: Mengimpor tipe data 'CourseWithStats' yang benar dari file types Anda.
import type { CourseWithStats } from "@/types";

import { CourseCard } from "@/components/discovery/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Komponen untuk menampilkan tombol filter kategori
const CategoryFilters = ({
  categories,
  selected,
  onSelect,
}: {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}) => (
  <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-12">
    {["Semua", ...categories].map((category) => (
      <Button
        key={category}
        variant="outline"
        size="lg"
        onClick={() => onSelect(category)}
        className={cn(
          "rounded-full transition-all duration-200",
          selected === category
            ? "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/50"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        {category}
      </Button>
    ))}
  </div>
);

// Komponen utama halaman dasbor/penemuan
export default function DiscoveryPage() {
  const [isLoading, setIsLoading] = useState(true);
  // FIX 2: State 'courses' sekarang menggunakan tipe data CourseWithStats[] yang benar.
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // State untuk fungsionalitas filter dan pencarian
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mengambil data kursus dan kategori secara bersamaan untuk efisiensi
        const [coursesRes, categoriesRes] = await Promise.all([
          fetch("/api/community/discovery"),
          fetch("/api/community/categories"),
        ]);
        if (!coursesRes.ok || !categoriesRes.ok) {
          throw new Error("Gagal memuat data dari server.");
        }
        setCourses(await coursesRes.json());
        setCategories(await categoriesRes.json());
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Logika untuk memfilter kursus berdasarkan kategori dan pencarian
  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        // Filter berdasarkan kategori
        if (selectedCategory === "Semua") return true;
        return course.category === selectedCategory;
      })
      .filter((course) => {
        // Filter berdasarkan pencarian teks (judul atau kreator)
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          course.title.toLowerCase().includes(searchLower) ||
          course.creator.name.toLowerCase().includes(searchLower)
        );
      });
  }, [courses, selectedCategory, searchTerm]);

  // Fungsi untuk me-render konten utama (loading, hasil, atau pesan kosong)
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Memuat Kursus...</p>
        </div>
      );
    }

    if (filteredCourses.length > 0) {
      return (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Link href={`/courses/${course.id}`} className="h-full block">
                {/* FIX 3: Mengirim prop 'course' ke komponen CourseCard, bukan 'template'. */}
                <CourseCard course={course} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      );
    }

    // Tampilan jika tidak ada hasil yang cocok dengan filter
    return (
      <div className="text-center py-20 bg-muted/50 rounded-xl">
        <XCircle className="mx-auto h-16 w-16 text-muted-foreground/70" />
        <h3 className="mt-6 text-2xl font-semibold">Tidak Ditemukan</h3>
        <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
          Tidak ada kursus yang cocok dengan filter atau pencarian Anda. Coba
          gunakan kata kunci atau kategori lain.
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Bagian Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight lg:text-6xl">
          Jelajahi Ekosistem Kursus
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Temukan pengetahuan baru, tingkatkan keahlian Anda, dan dapatkan
          kredensial on-chain dari para ahli di dunia Web3.
        </p>
      </div>

      {/* Bilah Pencarian */}
      <div className="mb-8 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari berdasarkan judul kursus atau nama kreator..."
            className="w-full pl-12 h-14 text-base rounded-full shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Kategori */}
      {!isLoading && categories.length > 0 && (
        <CategoryFilters
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      )}

      {/* Konten Kursus yang Dirender */}
      <div className="mt-8">{renderContent()}</div>
    </div>
  );
}
