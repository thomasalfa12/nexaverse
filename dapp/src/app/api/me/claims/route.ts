// app/api/me/claims/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
// GANTI: Impor helper sesi yang benar
import { getAppSession } from "@/lib/auth";

export async function GET() {
  try {
    // GANTI: Gunakan getAppSession untuk mendapatkan data sesi
    const session = await getAppSession();

    // Sesuaikan pengecekan dengan objek sesi yang baru
    if (!session?.user?.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWallet = session.user.address.toLowerCase();

    const claimableRecords = await prisma.eligibilityRecord.findMany({
      where: {
        userWalletAddress: userWallet,
        status: "ELIGIBLE",
        template: {
          templateType: 'CREDENTIAL'
        }
      },
      include: {
        template: {
          include: {
            creator: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(claimableRecords);
  } catch (error) {
    console.error("Error fetching claims:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}