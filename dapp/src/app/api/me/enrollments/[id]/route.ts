import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
// 1. GANTI: Impor helper sesi yang benar
import { getAppSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    // 2. GANTI: Gunakan getAppSession untuk mendapatkan data sesi
    const session = await getAppSession();

    // 3. GANTI: Pengecekan sesi yang lebih sederhana dan kuat
    if (!session?.user?.id) {
      // Jika pengguna tidak login, mereka pasti belum terdaftar.
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 4. HAPUS: Tidak perlu lagi mencari profil terpisah

    // 5. GANTI: Cari pendaftaran langsung menggunakan userId dari sesi
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        // Menggunakan indeks unik gabungan yang baru: userId_templateId
        userId_templateId: {
          userId: session.user.id,
          templateId: params.courseId,
        },
      },
    });

    if (enrollment) {
      // Pengguna ditemukan, kembalikan data pendaftaran
      return NextResponse.json(enrollment);
    } else {
      // Pengguna tidak ditemukan, kembalikan status 404
      return NextResponse.json({ error: "Tidak terdaftar" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
