import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { user } = await getAuth();
    if (!user?.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cari profil berdasarkan alamat wallet pengguna yang login
    const profile = await prisma.profile.findUnique({
      where: { walletAddress: user.address.toLowerCase() },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });
    }

    // Periksa apakah pengguna ini juga merupakan entitas terverifikasi
    const verifiedEntity = await prisma.verifiedEntity.findUnique({
        where: { walletAddress: user.address.toLowerCase() },
        select: { id: true }
    });

    // Tambahkan properti `isVerified` ke objek yang dikembalikan
    const profileWithVerification = {
        ...profile,
        isVerifiedInstitution: !!verifiedEntity
    };

    return NextResponse.json(profileWithVerification);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}