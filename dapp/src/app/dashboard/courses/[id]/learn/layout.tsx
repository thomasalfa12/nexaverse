// File: app/dashboard/courses/[id]/learn/layout.tsx (REVISI LENGKAP)

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/learning/UserAvatar"; // <-- Impor komponen yang baru dibuat

function LearningHeader({ courseId }: { courseId: string }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b px-4 sm:px-6 bg-background">
      {/* Tombol kembali sekarang dinamis ke detail kursus spesifik */}
      <Button variant="outline" asChild size="sm">
        <Link href={`/courses/${courseId}`}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Kembali ke Detail Kursus
        </Link>
      </Button>

      <div className="flex items-center gap-4">
        <UserAvatar />
      </div>
    </header>
  );
}

export default function ImmersiveLearningLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <LearningHeader courseId={params.id} />
      {children}
    </div>
  );
}
