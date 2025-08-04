// File: components/learning/LearningSidebar.tsx (REVISI LENGKAP)

"use client";

import type { FullModuleData } from "@/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; // <-- Sekarang seharusnya sudah ada
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // <-- Hapus SheetHeader & SheetTitle
import {
  Menu,
  CheckCircle,
  FileText,
  PlayCircle,
  Mic,
  Pencil,
  HelpCircle,
} from "lucide-react"; // <-- PlayCircle akan dipakai

// Helper yang lebih cerdas untuk mendapatkan ikon
const getModuleIcon = (module: FullModuleData) => {
  if (module.type === "CONTENT") {
    return module.videoContent ? (
      <PlayCircle className="mr-3 h-5 w-5 flex-shrink-0" />
    ) : (
      <FileText className="mr-3 h-5 w-5 flex-shrink-0" />
    );
  }
  switch (module.type) {
    case "LIVE_SESSION":
      return <Mic className="mr-3 h-5 w-5 flex-shrink-0" />;
    case "SUBMISSION":
      return <Pencil className="mr-3 h-5 w-5 flex-shrink-0" />;
    case "QUIZ":
      return <HelpCircle className="mr-3 h-5 w-5 flex-shrink-0" />;
    default:
      return <FileText className="mr-3 h-5 w-5 flex-shrink-0" />;
  }
};

interface SidebarProps {
  courseTitle: string;
  creatorName: string;
  modules: FullModuleData[];
  activeModuleId: string | null;
  onSelectModule: (moduleId: string) => void;
  completedModules: Set<string>;
  progress: number;
}

function SidebarContent({
  courseTitle,
  creatorName,
  modules,
  activeModuleId,
  onSelectModule,
  completedModules,
  progress,
}: SidebarProps) {
  return (
    <>
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold truncate" title={courseTitle}>
          {courseTitle}
        </h2>
        <p className="text-sm text-muted-foreground">Oleh: {creatorName}</p>
        <div className="mt-4 space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {Math.round(progress)}% selesai
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {modules.map((module) => {
          const isCompleted = completedModules.has(module.id);
          return (
            <Button
              key={module.id}
              variant={activeModuleId === module.id ? "secondary" : "ghost"}
              className="w-full justify-start text-left h-auto py-3"
              onClick={() => onSelectModule(module.id)}
            >
              {getModuleIcon(module)}
              <span className="flex-1 truncate">{module.title}</span>
              {isCompleted && (
                <CheckCircle className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />
              )}
            </Button>
          );
        })}
      </nav>
    </>
  );
}

// Sidebar untuk Desktop
export function LearningSidebar(props: SidebarProps) {
  return (
    <aside className="w-80 border-r bg-background flex-col h-full hidden lg:flex">
      <SidebarContent {...props} />
    </aside>
  );
}

// Sidebar untuk Mobile (menggunakan Sheet/Drawer)
export function LearningSidebarMobile(props: SidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Menu className="mr-2 h-4 w-4" />
          Menu Kursus
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-80 flex flex-col">
        <SidebarContent {...props} />
      </SheetContent>
    </Sheet>
  );
}
