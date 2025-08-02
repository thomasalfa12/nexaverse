// app/api/community/discovery/route.ts (Sudah Diperbaiki)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { CourseStatus } from "@prisma/client"; // Impor enum

export async function GET() {
  try {
    // FIX: Mengganti query ke model 'Course'
    const courses = await prisma.course.findMany({
      where: {
        status: CourseStatus.PUBLISHED, // Menggunakan enum
        // Filter untuk memastikan kursus ini memiliki setidaknya satu modul
        modules: {
          some: {},
        },
      },
      include: {
        modules: { select: { id: true } }, // Hanya ambil ID untuk efisiensi
        _count: { 
          select: { 
            enrollments: true,
          } 
        },
        creator: { select: { name: true } },
        pricing: true, // Sertakan juga data harga
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Failed to fetch discovery data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}