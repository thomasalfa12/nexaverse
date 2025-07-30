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

    // Cari semua kredensial yang dimiliki oleh profil pengguna yang login
    const credentials = await prisma.curatedCredential.findMany({
      where: {
        owner: {
          walletAddress: user.address.toLowerCase()
        }
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