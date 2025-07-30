"use client";

import type { TemplateWithStats } from "@/types";
import { Button } from "@/components/ui/button";
import { FileText, PlayCircle } from "lucide-react";

interface LearningSidebarProps {
  course: TemplateWithStats;
  activeModuleId: string | null;
  onSelectModule: (moduleId: string) => void;
}

export function LearningSidebar({
  course,
  activeModuleId,
  onSelectModule,
}: LearningSidebarProps) {
  return (
    <aside className="w-80 border-r bg-background p-4 flex-col h-full hidden lg:flex">
      <h2 className="text-xl font-bold mb-4 px-2 truncate" title={course.title}>
        {course.title}
      </h2>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {course.modules.length > 0 ? (
          course.modules.map((module) => (
            <Button
              key={module.id}
              variant={activeModuleId === module.id ? "secondary" : "ghost"}
              className="w-full justify-start text-left h-auto py-2"
              onClick={() => onSelectModule(module.id)}
            >
              {module.type === "CONTENT" ? (
                <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
              ) : (
                <PlayCircle className="mr-2 h-4 w-4 flex-shrink-0" />
              )}
              <span className="truncate">{module.title}</span>
            </Button>
          ))
        ) : (
          <div className="p-2 text-sm text-muted-foreground">
            Kurikulum belum tersedia.
          </div>
        )}
      </nav>
    </aside>
  );
}
