import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
// GANTI: Impor getAppSession dari lib/auth
import { getAppSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // GANTI: Gunakan getAppSession untuk mendapatkan data user
    const session = await getAppSession();
    
    // Sesuaikan pengecekan dengan objek session baru
    if (!session?.user?.id || !session.user.roles.includes("VERIFIED_ENTITY")) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    // Gunakan `entityId` langsung dari sesi untuk keamanan dan efisiensi
    if (!session.user.entityId) {
       return NextResponse.json({ error: "ID Entitas tidak ditemukan di sesi" }, { status: 404 });
    }

    const templates = await prisma.credentialTemplate.findMany({
      where: { 
        creatorId: session.user.entityId, // Gunakan ID dari sesi
        templateType: 'COURSE'
      },
      include: {
        modules: {
          orderBy: { stepNumber: 'asc' }
        },
        _count: {
          select: {
            eligibilityList: true,
            issuedCredentials: true,
            enrollments: true,
          },
        },
        creator: { select: { name: true } },
        pricing: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Gagal mengambil data template:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
