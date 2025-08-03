import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  // FIX: Ekstrak courseId dari params di baris paling awal
  const courseId = params.courseId;

  try {
    const session = await getAppSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId, // Gunakan variabel courseId
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Anda belum terdaftar di kursus ini" }, { status: 403 });
    }

    // Jika terdaftar, ambil semua data kursus dan konten modulnya
    const courseData = await prisma.course.findUnique({
      where: { id: courseId }, // Gunakan variabel courseId
      include: {
        creator: { select: { name: true } },
        modules: {
          orderBy: { stepNumber: 'asc' },
          include: {
            textContent: true,
            liveSession: true,
            assignment: true,
            quiz: true,
          }
        }
      }
    });

    if (!courseData) {
      return NextResponse.json({ error: "Kursus tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(courseData);

  } catch (error) {
    console.error(`[API LEARN ERROR] for course ${courseId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
