// File: app/dashboard/course/[id]/learn/page.tsx (REVISI LENGKAP)

import { notFound } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { prisma } from "@/lib/server/prisma"; // <-- Path prisma yang benar
import { LearningViewClient } from "@/components/learning/LearningViewClient";
import type { FullCourseLearningData } from "@/types";

// Fungsi data-fetching yang dijalankan di server
async function getLearningData(
  courseId: string,
  userId: string
): Promise<FullCourseLearningData | null> {
  // 1. Validasi pendaftaran terlebih dahulu, sama seperti API Anda
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId: userId, courseId: courseId },
    },
  });

  if (!enrollment) {
    return null; // User tidak terdaftar
  }

  // 2. Jika terdaftar, fetch semua data kursus yang relevan
  const courseData = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      creator: { select: { name: true } },
      modules: {
        orderBy: { stepNumber: "asc" },
        include: {
          textContent: true,
          videoContent: true, // <-- Jangan lupa video
          liveSession: true,
          assignment: true,
          quiz: true,
          submissions: {
            // <-- Fetch submission dari user yang sedang login
            where: { userId: userId },
          },
        },
      },
    },
  });

  if (!courseData) {
    return null; // Kursus tidak ditemukan
  }

  // 3. Gabungkan data kursus dengan data pendaftaran menjadi satu objek
  return {
    ...courseData,
    enrollment,
  };
}

export default async function LearningPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return notFound();
  }

  const learningData = await getLearningData(params.id, session.user.id);

  if (!learningData) {
    // Jika data null (user tidak terdaftar atau kursus tidak ada)
    return notFound();
  }

  // Serahkan data lengkap ke komponen client
  return <LearningViewClient initialData={learningData} />;
}
