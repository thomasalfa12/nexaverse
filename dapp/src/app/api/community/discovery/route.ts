import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  try {
    const courses = await prisma.credentialTemplate.findMany({
      where: {
        status: 'PUBLISHED',
        
        // Filter yang sudah ada untuk memastikan ini adalah kursus multi-modul
        modules: {
          some: {},
        },
      },
      include: {
        modules: { select: { id: true } },
        _count: { 
          select: { 
            enrollments: true,
            // Anda mungkin ingin menyertakan statistik lain di sini jika perlu
          } 
        },
        creator: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Failed to fetch discovery data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
