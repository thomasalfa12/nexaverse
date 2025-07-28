"use client";

import { Button } from "@/components/ui/button";
import { LogOut, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

function LearningHeader() {
  const params = useParams();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b px-4 sm:px-6 bg-background/80 backdrop-blur-lg">
      <div>
        {courseId && (
          <Button variant="outline" asChild>
            <Link href={`/courses/${courseId}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Kembali ke Detail Kursus
            </Link>
          </Button>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Di sini Anda bisa menambahkan logika logout yang sebenarnya */}
        <Button variant="ghost">
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </Button>
      </div>
    </header>
  );
}

export default function ImmersiveLearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Tata letak ini tidak memanggil <SideNav>, sehingga hanya konten
    // halaman pembelajaran yang akan ditampilkan.
    <div className="flex min-h-screen w-full flex-col">
      <LearningHeader />
      {/* 'children' di sini akan menjadi page.tsx dari halaman learn */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
