import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    // 1. Dapatkan sesi pengguna
    const { user } = await getAuth();
    if (!user?.address) {
      // Jika pengguna tidak login, mereka pasti belum terdaftar.
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Cari profil pengguna berdasarkan alamat wallet
    const profile = await prisma.profile.findUnique({
      where: { walletAddress: user.address },
      select: { id: true }
    });

    if (!profile) {
      // Ini seharusnya jarang terjadi jika pengguna sudah login, tapi ini adalah pengaman
      return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });
    }

    // 3. Cari pendaftaran di database
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        // Menggunakan indeks unik gabungan yang kita definisikan di schema.prisma
        profileId_templateId: {
          profileId: profile.id,
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