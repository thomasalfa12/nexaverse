"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
// FIX: Tambahkan LayoutDashboard dan BookOpen ke dalam import
import {
  Loader2,
  XCircle,
  FileText,
  Video,
  ClipboardCheck,
  HelpCircle,
  Sparkles,
  Rocket,
  LayoutDashboard,
  BookOpen,
} from "lucide-react";

import type { CourseWithStats } from "@/types";
import { CourseCard } from "@/components/discovery/CourseCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Komponen Filter Kategori yang Disempurnakan ---
const categoryIcons: { [key: string]: React.ElementType } = {
  "Smart Contract": FileText,
  DeFi: Sparkles,
  NFT: Video,
  "Blockchain Fundamental": Rocket,
  "Web3 Development": ClipboardCheck,
  DAO: HelpCircle,
  Security: HelpCircle,
  Semua: LayoutDashboard,
};

const CategoryFilters = ({
  categories,
  selected,
  onSelect,
}: {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}) => {
  const allCategories = ["Semua", ...categories];

  return (
    <div className="flex items-center justify-center gap-3 md:gap-4 mb-16 flex-wrap">
      {allCategories.map((category) => {
        const Icon = categoryIcons[category] || BookOpen;
        return (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            key={category}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => onSelect(category)}
              className={cn(
                "rounded-full transition-all duration-300 ease-in-out border-2 h-14 px-6 text-base font-semibold",
                selected === category
                  ? "border-primary bg-primary/10 text-primary ring-4 ring-primary/20"
                  : "bg-background/50 border-border/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/50"
              )}
            >
              <Icon className="mr-2.5 h-5 w-5" />
              {category}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
};

// --- Komponen Utama Halaman Discovery ---
export default function DiscoveryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
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

  const filteredCourses = useMemo(() => {
    if (selectedCategory === "Semua") return courses;
    return courses.filter((course) => course.category === selectedCategory);
  }, [courses, selectedCategory]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            Memuat Kursus Terbaik...
          </p>
        </div>
      );
    }

    if (filteredCourses.length > 0) {
      return (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="h-full"
            >
              <Link href={`/courses/${course.id}`} className="h-full block">
                <CourseCard course={course} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      );
    }

    return (
      <div className="text-center py-20 bg-muted/50 rounded-xl">
        <XCircle className="mx-auto h-16 w-16 text-muted-foreground/70" />
        <h3 className="mt-6 text-2xl font-semibold">Tidak Ada Kursus</h3>
        <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
          Tidak ada kursus yang tersedia dalam kategori ini. Coba pilih kategori
          lain.
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-4 px-2">
      {/* Hero Section Baru */}
      <div className="relative text-center mb-16 py-20 md:py-28 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 z-0" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-10" />
        <div className="relative z-10 px-4">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white"
          >
            Jelajahi Galaksi Pengetahuan
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-6 text-lg md:text-xl text-blue-200/80 max-w-3xl mx-auto"
          >
            Temukan kursus Web3 terkurasi, tingkatkan keahlian Anda, dan
            dapatkan kredensial on-chain yang membuktikan pencapaian Anda.
          </motion.p>
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

      {/* Konten Kursus */}
      <div className="mt-8">
        <AnimatePresence>{renderContent()}</AnimatePresence>
      </div>
    </div>
  );
}
