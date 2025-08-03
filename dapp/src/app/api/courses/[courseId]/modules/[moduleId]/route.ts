// src/app/api/course/[courseId]/modules/[moduleId]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string, moduleId: string } }
) {
  try {
    // 1. Otentikasi: Pastikan pengguna sudah login
    const session = await getAppSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi. Silakan login untuk mengakses konten." }, { status: 401 });
    }

    // 2. Otorisasi: Verifikasi bahwa pengguna terdaftar di kursus ini
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: params.courseId,
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Anda belum terdaftar di kursus ini." }, { status: 403 });
    }

    // 3. JIKA LOLOS VERIFIKASI: Ambil konten modul yang spesifik
    const moduleWithContent = await prisma.courseModule.findUnique({
      where: { 
        id: params.moduleId,
        courseId: params.courseId // Pastikan modul ini milik kursus yang benar
      },
      // Gunakan `include` untuk mengambil data dari tabel konten yang relevan
      include: {
        textContent: true,
        liveSession: true,
        assignment: true,
        quiz: true,
      }
    });

    if (!moduleWithContent) {
      return NextResponse.json({ error: "Modul tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(moduleWithContent);

  } catch (error) {
    console.error("Gagal mengambil konten modul:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
