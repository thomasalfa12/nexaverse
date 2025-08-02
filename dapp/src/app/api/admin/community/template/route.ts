// src/app/api/admin/community/template/route.ts (Sudah Diperbaiki)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAppSession();
    
    if (!session?.user?.id || !session.user.roles.includes("VERIFIED_ENTITY") || !session.user.entityId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    // FIX: Mengganti prisma.credentialTemplate menjadi prisma.course
    const courses = await prisma.course.findMany({
      where: { 
        creatorId: session.user.entityId,
        // FIX: Menghapus 'templateType: 'COURSE'' karena sudah tidak relevan
      },
      include: {
        modules: {
          orderBy: { stepNumber: 'asc' }
        },
        _count: {
          select: {
            // FIX: Menyesuaikan _count hanya untuk relasi yang ada di model Course
            enrollments: true, 
          },
        },
        creator: { select: { name: true } },
        pricing: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Gagal mengambil data kursus:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}