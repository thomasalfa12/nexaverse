import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;

    if (!courseId) {
      return NextResponse.json({ error: "ID Kursus tidak valid" }, { status: 400 });
    }

    // Mengambil data kursus dari database
    const course = await prisma.credentialTemplate.findFirst({
      where: { 
        id: courseId, 
        // Ini adalah filter keamanan yang krusial:
        // Hanya kursus yang sudah diterbitkan yang bisa diakses publik.
        status: 'PUBLISHED' 
      },
      include: {
        // Menyertakan semua data yang dibutuhkan oleh halaman detail
        modules: { 
          orderBy: { stepNumber: 'asc' },
          select: {
            id: true,
            title: true,
            type: true,
            durationMinutes: true,
            stepNumber: true,
            // contentText tidak disertakan di sini untuk menjaga data tetap ringkas
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

    // Jika tidak ada kursus yang ditemukan (atau statusnya bukan PUBLISHED),
    // kembalikan error 404.
    if (!course) {
      return NextResponse.json({ error: "Kursus tidak ditemukan atau belum dipublikasikan" }, { status: 404 });
    }

    // Jika berhasil, kembalikan data kursus
    return NextResponse.json(course);
  } catch (error) {
    console.error(`[API ERROR] Gagal mengambil kursus ${params.courseId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}