// File: components/learning/VideoModuleView.tsx (BARU & LENGKAP)
import type { FullModuleData } from "@/types";

export function VideoModuleView({ module }: { module: FullModuleData }) {
  const videoUrl = module.videoContent?.videoUrl;
  if (!videoUrl)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Konten video tidak tersedia.
      </div>
    );

  // Mendeteksi platform untuk embed yang benar (contoh sederhana)
  const isYoutube =
    videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  let embedUrl = videoUrl;

  if (isYoutube) {
    const videoId =
      videoUrl.split("v=")[1]?.split("&")[0] || videoUrl.split("/").pop();
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  }
  // Anda bisa menambahkan logika untuk Vimeo, Mux, dll.

  return (
    <div>
      <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
        {module.title}
      </h1>
      <div className="aspect-video w-full rounded-lg overflow-hidden border">
        <iframe
          src={embedUrl}
          title={module.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
      {/* Di sini bisa ditambahkan deskripsi atau transkrip video jika ada */}
    </div>
  );
}
