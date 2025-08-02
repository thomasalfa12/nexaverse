// app/api/me/enrollments/[courseId]/route.ts (Sudah Diperbaiki)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";

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
        // FIX: Menggunakan indeks unik gabungan yang benar: userId_courseId
        userId_courseId: {
          userId: session.user.id,
          courseId: params.courseId,
        },
      },
    });

    if (enrollment) {
      return NextResponse.json(enrollment);
    } else {
      return NextResponse.json({ error: "Tidak terdaftar" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}