"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function Testimonials() {
  const testimonials = [
    {
      quote:
        "Nexaverse mengubah cara saya melihat sertifikasi. Sekarang, portofolio saya didukung oleh bukti on-chain yang tidak bisa dibantah. Ini adalah game-changer untuk karier saya.",
      name: "Andi Pratama",
      title: "Solidity Developer",
      avatar: "https://i.pravatar.cc/150?u=andi",
    },
    {
      quote:
        "Sebagai seorang kreator, saya mendapatkan kebebasan yang belum pernah saya rasakan sebelumnya. Saya mengontrol konten, harga, dan komunitas saya sendiri. Platform ini benar-benar untuk kreator.",
      name: "Citra Lestari",
      title: "Instruktur Web3",
      avatar: "https://i.pravatar.cc/150?u=citra",
    },
    {
      quote:
        "Proses pendaftarannya sangat mulus. Dalam hitungan menit, saya sudah bisa mengakses materi kursus berkualitas tinggi. Pengalaman belajarnya luar biasa!",
      name: "Budi Santoso",
      title: "Siswa & Antusias Kripto",
      avatar: "https://i.pravatar.cc/150?u=budi",
    },
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="px-4 bg-secondary/50">
      <div className="container mx-auto text-center max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Apa Kata Komunitas Kami
        </h2>
        <div className="mt-12 h-48 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <p className="text-xl md:text-2xl font-medium text-foreground">
                &quot;{testimonials[index].quote}&quot;
              </p>
              <div className="flex items-center mt-6">
                <img
                  src={testimonials[index].avatar}
                  alt={testimonials[index].name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="ml-4 text-left">
                  <p className="font-semibold">{testimonials[index].name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[index].title}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
