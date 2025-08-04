// File: src/components/learning/LearningViewClient.tsx (LENGKAP)

"use client";

import { useLearningState } from "@/hooks/useLearningState";
import type { FullCourseLearningData } from "@/types";
import { LearningSidebar, LearningSidebarMobile } from "./LearningSidebar";
import { ContentView } from "./ContentView";

interface LearningViewClientProps {
  initialData: FullCourseLearningData;
}

export function LearningViewClient({ initialData }: LearningViewClientProps) {
  const {
    course,
    sortedModules,
    activeModule,
    activeModuleId,
    setActiveModuleId,
    completedModules,
    handleCompleteAndGoNext,
    goToPrevious,
    progressPercentage,
    activeModuleIndex,
    totalModules,
  } = useLearningState({ initialData }); // <-- `initialData` di sini berasal dari props

  return (
    // 'h-[calc(100vh-4rem)]' karena header tingginya 4rem (h-16)
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar untuk Desktop */}
      <LearningSidebar
        courseTitle={course.title}
        creatorName={course.creator.name}
        modules={sortedModules}
        activeModuleId={activeModuleId}
        onSelectModule={setActiveModuleId}
        completedModules={completedModules}
        progress={progressPercentage}
      />

      {/* Konten Utama */}
      <main className="flex-1 overflow-y-auto">
        {/* Header Mobile dengan Sidebar Drawer */}
        <div className="lg:hidden sticky top-0 bg-background/80 backdrop-blur-sm p-2 border-b z-10">
          <LearningSidebarMobile
            courseTitle={course.title}
            creatorName={course.creator.name}
            modules={sortedModules}
            activeModuleId={activeModuleId}
            onSelectModule={setActiveModuleId}
            completedModules={completedModules}
            progress={progressPercentage}
          />
        </div>

        {activeModule ? (
          <ContentView
            key={activeModule.id} // Penting untuk re-mount component saat modul ganti
            module={activeModule}
            onComplete={handleCompleteAndGoNext}
            onPrevious={goToPrevious}
            isFirstModule={activeModuleIndex === 0}
            isLastModule={activeModuleIndex === totalModules - 1}
          />
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            Pilih modul untuk memulai.
          </div>
        )}
      </main>
    </div>
  );
}
