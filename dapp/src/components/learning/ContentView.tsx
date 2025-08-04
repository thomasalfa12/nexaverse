// File: components/learning/ContentView.tsx
import type { FullModuleData } from "@/types";
import { TextModuleView } from "./TextModuleView";
import { VideoModuleView } from "./VideoModuleView";
import { LiveSessionModuleView } from "./LiveSessionModuleView";
import { AssignmentModuleView } from "./AssignmentModuleView";
import { QuizModuleView } from "./QuizModuleView";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ContentView({
  module,
  onComplete,
  onPrevious,
  isFirstModule,
  isLastModule,
}: {
  module: FullModuleData;
  onComplete: () => void;
  onPrevious: () => void;
  isFirstModule: boolean;
  isLastModule: boolean;
}) {
  const renderModuleContent = () => {
    if (module.type === "CONTENT") {
      // Cek apakah ada URL video, jika ya, prioritaskan video
      if (module.videoContent?.videoUrl) {
        return <VideoModuleView module={module} />;
      }
      return <TextModuleView module={module} />;
    }

    switch (module.type) {
      case "LIVE_SESSION":
        return <LiveSessionModuleView module={module} />;
      case "SUBMISSION":
        return <AssignmentModuleView module={module} />;
      case "QUIZ":
        return <QuizModuleView module={module} onQuizCompleted={onComplete} />;
      default:
        return <TextModuleView module={module} />; // Default ke Teks
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900/50">
      <ScrollArea className="flex-grow">
        <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
          {renderModuleContent()}
        </div>
      </ScrollArea>

      {/* Footer Navigasi Cerdas */}
      <footer className="flex-shrink-0 p-4 border-t bg-background flex justify-between items-center">
        <Button variant="outline" onClick={onPrevious} disabled={isFirstModule}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Sebelumnya
        </Button>

        {module.type !== "QUIZ" && (
          <Button onClick={onComplete} size="lg">
            {isLastModule ? "Selesaikan Kursus" : "Tandai Selesai & Lanjutkan"}
            <CheckCircle className="ml-2 h-5 w-5" />
          </Button>
        )}
      </footer>
    </div>
  );
}
