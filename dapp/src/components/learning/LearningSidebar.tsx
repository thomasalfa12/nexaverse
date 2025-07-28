"use client";
import type { TemplateWithStats } from "@/types";
import { cn } from "@/lib/utils";

export function LearningSidebar({
  course,
  activeModuleId,
  onSelectModule,
}: {
  course: TemplateWithStats;
  activeModuleId: string | null;
  onSelectModule: (id: string) => void;
}) {
  return (
    <aside className="w-80 bg-muted h-full p-4 flex flex-col border-r">
      <h2 className="font-bold text-lg mb-4">{course.title}</h2>
      <nav className="flex flex-col gap-1">
        {course.modules.map((module) => (
          <button
            key={module.id}
            onClick={() => onSelectModule(module.id)}
            className={cn(
              "text-left p-2 rounded-md text-sm",
              activeModuleId === module.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            )}
          >
            {module.stepNumber}. {module.title}
          </button>
        ))}
      </nav>
    </aside>
  );
}
