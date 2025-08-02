// app/api/community/categories/route.ts (SOLUSI FINAL)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { CourseStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // FIX: Kita menyerah dengan query builder Prisma dan menggunakan $queryRaw.
    // Ini adalah cara untuk menulis query SQL secara langsung dan aman.
    const status = CourseStatus.PUBLISHED;
    const results: { category: string }[] = await prisma.$queryRaw`
      SELECT DISTINCT category
      FROM Course
      WHERE status = ${status}
      AND category IS NOT NULL
      AND category != ''
    `;

    // Hasil dari $queryRaw adalah array objek, jadi kita hanya perlu mengambil nilainya.
    const categoryList = results.map(row => row.category);
    
    return NextResponse.json(categoryList);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}