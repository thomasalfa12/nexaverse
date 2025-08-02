import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
// 1. GANTI: Impor helper sesi yang benar
import { getAppSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } } // Menggunakan courseId untuk konsistensi
) {
  try {
    // 2. GANTI: Gunakan getAppSession untuk otentikasi & otorisasi
    const session = await getAppSession();
    if (!session?.user?.id || !session.user.roles.includes("VERIFIED_ENTITY") || !session.user.entityId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. GANTI: Query yang disesuaikan dengan skema baru dan lebih aman
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: params.courseId, // FIX: Gunakan 'courseId'
        course: { // Pengecekan keamanan sudah benar
          creatorId: session.user.entityId,
        },
      },
      include: {
        // Relasi 'student' sekarang menunjuk ke model 'User'
        student: { 
          select: {
            walletAddress: true,
            name: true,
            image: true, // Ambil juga foto profil siswa untuk UI yang lebih kaya
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error(`[API GET Enrollments Error] for course ${params.courseId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
