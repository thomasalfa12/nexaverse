import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await getAuth();
    if (!user?.address || !user.roles.includes("VERIFIED_ENTITY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ambil semua pendaftaran untuk kursus ini, beserta detail profil siswa
    const enrollments = await prisma.enrollment.findMany({
      where: {
        templateId: params.id,
        course: {
          creator: {
            walletAddress: user.address, // Pastikan hanya kreator yang bisa melihat
          },
        },
      },
      include: {
        student: { // Ambil data dari model Profile
          select: {
            walletAddress: true,
            name: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}