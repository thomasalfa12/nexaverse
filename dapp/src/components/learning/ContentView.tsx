"use client";
import { useEffect, useState } from "react";
import type { CourseModule } from "@/types";

export function ContentView({ moduleId }: { moduleId: string | null }) {
  const [moduleData, setModuleData] = useState<CourseModule | null>(null);

  useEffect(() => {
    if (moduleId) {
      // Di aplikasi nyata, Anda akan fetch detail modul dari API
      // setModuleData(await fetch(`/api/modules/${moduleId}`).then(res => res.json()));
      // Untuk sekarang, kita gunakan placeholder
      setModuleData({
        id: moduleId,
        title: `Konten untuk Modul ${moduleId}`,
        type: "CONTENT",
      } as CourseModule);
    }
  }, [moduleId]);

  if (!moduleId || !moduleData) {
    return <div>Pilih modul dari sidebar untuk memulai.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{moduleData.title}</h1>
      <p>Konten untuk modul ini akan ditampilkan di sini.</p>
    </div>
  );
}
