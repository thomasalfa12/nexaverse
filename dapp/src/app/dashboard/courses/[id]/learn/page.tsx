// =======================================================================
// FILE 2: HALAMAN BELAJAR YANG AMAN (DISESUAIKAN & DIPERBAIKI)
// File: app/dashboard/courses/[id]/learn/page.tsx
// =======================================================================
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOnchainEnrollment } from "@/hooks/useOnchainEnrollment";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { TemplateWithStats } from "@/types";
import { LearningSidebar } from "@/components/learning/LearningSidebar";
import { ContentView } from "@/components/learning/ContentView";

export default function LearningPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();
  const [courseData, setCourseData] = useState<TemplateWithStats | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isFetchingCourse, setIsFetchingCourse] = useState(true);

  const courseContractAddress = courseData?.contractAddress as `0x${string}`;
  const { isEnrolled, isLoading: isCheckingEnrollment } = useOnchainEnrollment(
    courseContractAddress
  );

  // Efek untuk mengambil data kursus dari API
  useEffect(() => {
    if (!courseId) return;
    const fetchCourseData = async () => {
      setIsFetchingCourse(true);
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCourseData(data);
          if (data.modules && data.modules.length > 0) {
            setActiveModuleId(data.modules[0].id);
          }
        } else {
          toast.error("Gagal memuat data kursus.");
          router.replace("/dashboard");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan saat memuat kursus.");
        console.error("Error fetching course data:", error);
        router.replace("/dashboard");
      } finally {
        setIsFetchingCourse(false);
      }
    };
    fetchCourseData();
  }, [courseId, router]);

  // Efek keamanan untuk mengarahkan pengguna keluar jika tidak terdaftar
  useEffect(() => {
    // Hanya jalankan logika ini setelah kedua proses loading selesai
    if (!isFetchingCourse && !isCheckingEnrollment) {
      if (!isEnrolled) {
        toast.error("Akses Ditolak", {
          description: "Anda belum terdaftar di kursus ini.",
        });
        router.replace(`/courses/${courseId}`);
      }
    }
  }, [isFetchingCourse, isCheckingEnrollment, isEnrolled, router, courseId]);

  // Tampilkan loading state jika data kursus atau status pendaftaran sedang dimuat
  if (isFetchingCourse || isCheckingEnrollment) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Memverifikasi akses Anda...</p>
      </div>
    );
  }

  // Jika lolos semua pengecekan, tampilkan layout ruang belajar
  if (isEnrolled && courseData) {
    return (
      // PERBAIKAN KUNCI: Mengubah `h-screen` menjadi `h-full`
      // Ini akan membuat div mengisi sisa ruang di dalam <main>, bukan seluruh layar.
      <div className="flex h-full">
        <LearningSidebar
          course={courseData}
          activeModuleId={activeModuleId}
          onSelectModule={setActiveModuleId}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <ContentView courseId={courseId} moduleId={activeModuleId} />
        </main>
      </div>
    );
  }

  // Fallback jika terjadi kondisi aneh (misalnya, redirect sedang diproses)
  return null;
}
