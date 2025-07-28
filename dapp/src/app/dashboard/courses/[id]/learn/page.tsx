"use client";
import { useParams, useRouter } from "next/navigation";
import { LearningSidebar } from "@/components/learning/LearningSidebar";
import { ContentView } from "@/components/learning/ContentView";
import { useOnchainEnrollment } from "@/hooks/useOnchainEnrollment";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { TemplateWithStats } from "@/types";

export default function LearningPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();
  const [courseData, setCourseData] = useState<TemplateWithStats | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  const courseContractAddress = courseData?.contractAddress as `0x${string}`;
  const { isEnrolled, isLoading: isCheckingEnrollment } = useOnchainEnrollment(
    courseContractAddress
  );

  useEffect(() => {
    const fetchCourseData = async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourseData(data);
        if (data.modules && data.modules.length > 0) {
          setActiveModuleId(data.modules[0].id);
        }
      }
    };
    if (courseId) fetchCourseData();
  }, [courseId]);

  if (isCheckingEnrollment || !courseData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />{" "}
        <span className="ml-4">Memverifikasi akses on-chain...</span>
      </div>
    );
  }

  if (!isEnrolled) {
    // Jika verifikasi selesai dan ternyata tidak terdaftar, tendang keluar.
    toast.error("Akses Ditolak", {
      description: "Anda belum terdaftar di kursus ini.",
    });
    router.replace(`/courses/${courseId}`);
    return null;
  }

  return (
    <div className="flex h-full">
      <LearningSidebar
        course={courseData}
        activeModuleId={activeModuleId}
        onSelectModule={setActiveModuleId}
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <ContentView moduleId={activeModuleId} />
      </main>
    </div>
  );
}
