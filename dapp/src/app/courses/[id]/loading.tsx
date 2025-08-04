// app/courses/[id]/loading.tsx
import { Loader2 } from "lucide-react";

export default function CourseLoading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Memuat kursus...</p>
      </div>
    </div>
  );
}
