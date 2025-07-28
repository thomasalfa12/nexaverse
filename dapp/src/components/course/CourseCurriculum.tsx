"use client";
import type { CourseModule } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Video, FileText, ClipboardCheck, HelpCircle } from "lucide-react";

const moduleIcons: Record<string, React.ElementType> = {
  CONTENT: FileText,
  LIVE_SESSION: Video,
  SUBMISSION: ClipboardCheck,
  QUIZ: HelpCircle,
};

export function CourseCurriculum({ modules }: { modules: CourseModule[] }) {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-2xl font-bold mb-4">Kurikulum Kursus</h2>
      <Accordion type="single" collapsible className="w-full">
        {modules.map((module, index) => {
          const Icon = moduleIcons[module.type] || FileText;
          return (
            <AccordionItem value={`item-${index}`} key={module.id}>
              <AccordionTrigger className="hover:no-underline text-left">
                <div className="flex items-center gap-4">
                  <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="font-medium">
                    {index + 1}. {module.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-12 pt-2">
                <p className="text-muted-foreground">
                  {module.contentText ||
                    `Detail untuk modul ini akan tersedia saat Anda mendaftar.`}
                </p>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
