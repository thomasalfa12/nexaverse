import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { user } = await getAuth();
    if (!user?.address) {
      // Jika pengguna tidak login, mereka pasti belum terdaftar.
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { walletAddress: user.address },
      select: { id: true }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
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
      // Pengguna tidak ditemukan
      return NextResponse.json({ error: "Tidak terdaftar" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}