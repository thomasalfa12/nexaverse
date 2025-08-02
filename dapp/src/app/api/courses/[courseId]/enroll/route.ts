// src/app/api/course/[courseId]/enroll/route.ts (Sudah Diperbaiki)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";
import { EnrollmentStatus } from "@prisma/client"; // Impor enum

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getAppSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const courseId = params.courseId;

    // FIX 1: Cek pendaftaran menggunakan indeks unik yang benar: `userId_courseId`
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json({ message: "Anda sudah terdaftar di kursus ini." }, { status: 200 });
    }

    // FIX 2: Buat pendaftaran baru dengan field `courseId` yang benar
    const newEnrollment = await prisma.enrollment.create({
      data: {
        userId: userId,
        courseId: courseId, // Mengganti `templateId` menjadi `courseId`
        status: EnrollmentStatus.IN_PROGRESS,
      }
    });

    return NextResponse.json(newEnrollment, { status: 201 });

  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}