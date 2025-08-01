import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
// 1. GANTI: Impor helper sesi yang benar
import { getAppSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 2. GANTI: Gunakan getAppSession untuk mendapatkan data sesi
    const session = await getAppSession();
    
    // 3. GANTI: Pengecekan sesi yang lebih sederhana dan kuat
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 4. GANTI: Query langsung ke CuratedCredential menggunakan userId dari sesi
    const credentials = await prisma.curatedCredential.findMany({
      where: {
        // Menggunakan relasi langsung ke User model
        userId: session.user.id
      },
      include: {
        // Sertakan nama penerbit untuk ditampilkan di kartu
        issuer: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(credentials);
  } catch (error) {
    console.error("Error fetching credentials:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
