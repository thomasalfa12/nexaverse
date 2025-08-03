"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
// Tipe baru kita sekarang sudah benar
import type { FullCourseData, FullModuleData } from "@/types";
import { LearningSidebar } from "@/components/learning/LearningSidebar";
import { ContentView } from "@/components/learning/ContentView";

export default function LearningPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [courseData, setCourseData] = useState<FullCourseData | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/learn/courses/${courseId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Gagal memuat data kursus.");
        }

        const data: FullCourseData = await res.json();
        setCourseData(data);

        if (data.modules && data.modules.length > 0) {
          setActiveModuleId(data.modules[0].id);
        }
      } catch (error) {
        toast.error("Gagal Memuat Kursus", {
          description: (error as Error).message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">
          Mempersiapkan Ruang Belajar Anda...
        </p>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="text-center h-full flex items-center justify-center">
        <p>Kursus tidak dapat ditemukan.</p>
      </div>
    );
  }

  // FIX: Beri tipe yang benar pada parameter 'm'
  const activeModule = courseData.modules.find(
    (m: FullModuleData) => m.id === activeModuleId
  );

  return (
    <div className="flex h-full">
      <LearningSidebar
        course={courseData}
        activeModuleId={activeModuleId}
        onSelectModule={setActiveModuleId}
      />
      <main className="flex-1 overflow-y-auto">
        {activeModule && <ContentView module={activeModule} />}
      </main>
    </div>
  );
}
