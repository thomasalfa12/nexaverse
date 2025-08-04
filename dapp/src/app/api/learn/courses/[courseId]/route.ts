import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getAppSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: params.courseId,
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Anda belum terdaftar di kursus ini" }, { status: 403 });
    }

    const courseData = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        creator: { select: { name: true } },
        modules: {
          orderBy: { stepNumber: 'asc' },
          include: {
            textContent: true,
            liveSession: true,
            assignment: true,
            quiz: true,
            // Sertakan data submission siswa untuk modul ini
            submissions: {
              where: { userId: session.user.id }
            }
          }
        }
      }
    });

    if (!courseData) {
      return NextResponse.json({ error: "Kursus tidak ditemukan" }, { status: 404 });
    }
    
    // Gabungkan data pendaftaran (progres) dengan data kursus
    const responseData = {
      ...courseData,
      enrollment,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`[API LEARN ERROR] for course ${params.courseId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
