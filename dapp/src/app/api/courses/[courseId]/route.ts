// src/app/api/course/[courseId]/modules/route.ts (Sudah Diperbaiki)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { CourseStatus } from "@prisma/client"; // Impor enum

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;

    if (!courseId) {
      return NextResponse.json({ error: "ID Kursus tidak valid" }, { status: 400 });
    }

    // FIX: Mengganti query ke model `Course`
    const course = await prisma.course.findFirst({
      where: { 
        id: courseId, 
        status: CourseStatus.PUBLISHED // Menggunakan enum
      },
      include: {
        // Semua relasi di bawah ini sudah benar sesuai skema baru
        modules: { 
          orderBy: { stepNumber: 'asc' },
          select: {
            id: true,
            title: true,
            type: true,
            durationMinutes: true,
            stepNumber: true,
          }
        },
        creator: { 
          select: { 
            name: true, 
            bio: true 
          } 
        },
        pricing: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Kursus tidak ditemukan atau belum dipublikasikan" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error(`[API ERROR] Gagal mengambil kursus ${params.courseId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}