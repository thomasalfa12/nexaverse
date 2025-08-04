// File: hooks/use-learning-state.ts (REVISI LENGKAP)

"use client";

import { useState, useMemo } from "react"; // <-- Hapus useEffect
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { FullCourseLearningData } from "@/types"; // <-- Hapus FullModuleData

interface LearningStateProps {
  initialData: FullCourseLearningData;
}

export function useLearningState({ initialData }: LearningStateProps) {
  const { enrollment: initialEnrollment, ...initialCourse } = initialData;
  const initialProgress = initialEnrollment.progress;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortedModules = useMemo(
    () => [...initialCourse.modules].sort((a, b) => a.stepNumber - b.stepNumber),
    [initialCourse.modules]
  );

  const initialCompletedModules = useMemo(() => {
    return new Set(sortedModules.slice(0, initialProgress).map((m) => m.id));
  }, [initialProgress, sortedModules]);

  const [completedModules, setCompletedModules] = useState<Set<string>>(initialCompletedModules);

  const activeModuleId = searchParams.get("module") || sortedModules[0]?.id;

  const activeModule = useMemo(
    () => sortedModules.find((m) => m.id === activeModuleId),
    [activeModuleId, sortedModules]
  );

  const activeModuleIndex = useMemo(
    () => sortedModules.findIndex((m) => m.id === activeModuleId),
    [activeModuleId, sortedModules]
  );

  const setActiveModuleId = (moduleId: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("module", moduleId);
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const handleCompleteAndGoNext = async () => {
    if (!activeModule) return;

    const newCompleted = new Set(completedModules);
    newCompleted.add(activeModule.id);
    setCompletedModules(newCompleted);

    toast.promise(
      fetch(`/api/learn/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: initialCourse.id,
          completedModulesCount: newCompleted.size,
        }),
      }),
      {
        loading: "Menyimpan progres...",
        success: "Progres berhasil disimpan!",
        error: "Gagal menyimpan progres.",
      }
    );

    const nextModule = sortedModules[activeModuleIndex + 1];
    if (nextModule) {
      setActiveModuleId(nextModule.id);
    } else {
      toast.success("Selamat!", { description: "Anda telah menyelesaikan kursus ini." });
      router.push(`/dashboard`);
    }
  };

  const goToPrevious = () => {
    const prevModule = sortedModules[activeModuleIndex - 1];
    if (prevModule) setActiveModuleId(prevModule.id);
  };

  const progressPercentage = (completedModules.size / sortedModules.length) * 100;

  return {
    course: initialCourse,
    sortedModules,
    activeModule,
    activeModuleId,
    setActiveModuleId,
    completedModules,
    handleCompleteAndGoNext,
    goToPrevious,
    progressPercentage,
    activeModuleIndex,
    totalModules: sortedModules.length,
  };
}