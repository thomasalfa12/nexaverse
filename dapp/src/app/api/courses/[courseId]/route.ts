import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { CourseStatus } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> } // Ubah ke Promise
) {
  try {
    const { courseId } = await params; // Await params dulu
    
    console.log("[DEBUG] Mencari kursus dengan ID:", courseId);

    if (!courseId) {
      return NextResponse.json({ error: "ID Kursus tidak valid" }, { status: 400 });
    }

    const courseExists = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, status: true, title: true }
    });

    console.log("[DEBUG] Kursus ditemukan:", courseExists);

    if (!courseExists) {
      return NextResponse.json({ 
        error: "Kursus dengan ID tersebut tidak ditemukan di database" 
      }, { status: 404 });
    }

    if (courseExists.status !== CourseStatus.PUBLISHED) {
      return NextResponse.json({ 
        error: `Kursus "${courseExists.title}" belum dipublikasikan (status: ${courseExists.status})` 
      }, { status: 403 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: { 
          orderBy: { stepNumber: 'asc' },
          select: {
            id: true,
            title: true,
            type: true,
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

    return NextResponse.json(course);
  } catch (error) {
    console.error(`[API ERROR] Gagal mengambil kursus:`, error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}