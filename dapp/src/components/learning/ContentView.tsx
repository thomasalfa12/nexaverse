import type { FullModuleData } from "@/types";
import { TextModuleView } from "./TextModuleView";
import { LiveSessionModuleView } from "./LiveSessionModuleView";
import { AssignmentModuleView } from "./AssignmentModuleView";
import { QuizModuleView } from "./QuizModuleView";

export function ContentView({ module }: { module: FullModuleData }) {
  // Render komponen yang sesuai berdasarkan tipe modul
  switch (module.type) {
    case "CONTENT":
      return <TextModuleView module={module} />;
    case "LIVE_SESSION":
      return <LiveSessionModuleView module={module} />;
    case "SUBMISSION":
      return <AssignmentModuleView module={module} />;
    case "QUIZ":
      return <QuizModuleView module={module} />;
    default:
      return <div className="p-8">Tipe modul tidak dikenali.</div>;
  }
}
