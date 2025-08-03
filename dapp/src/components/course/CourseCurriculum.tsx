"use client";
import type { CourseModule } from "@prisma/client"; // Langsung gunakan tipe dari Prisma
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

// Deskripsi generik untuk setiap tipe modul
const moduleDescriptions: Record<string, string> = {
  CONTENT: "Materi pembelajaran berbasis teks dan gambar.",
  LIVE_SESSION: "Sesi interaktif langsung dengan kreator.",
  SUBMISSION: "Tugas yang perlu dikumpulkan untuk penilaian.",
  QUIZ: "Kuis untuk menguji pemahaman Anda.",
};

export function CourseCurriculum({
  modules,
}: {
  modules: Pick<CourseModule, "id" | "title" | "type" | "stepNumber">[];
}) {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-2xl font-bold mb-4">Kurikulum Kursus</h2>
      <Accordion type="single" collapsible className="w-full">
        {modules.map((module) => {
          const Icon = moduleIcons[module.type] || FileText;
          // 1. Gunakan deskripsi generik berdasarkan tipe modul
          const description =
            moduleDescriptions[module.type] ||
            "Detail modul akan tersedia setelah Anda mendaftar.";

          return (
            <AccordionItem value={module.id} key={module.id}>
              <AccordionTrigger className="hover:no-underline text-left">
                <div className="flex items-center gap-4">
                  <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="font-medium text-lg">
                    {module.stepNumber}. {module.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-12 pt-2">
                <p className="text-muted-foreground">{description}</p>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
