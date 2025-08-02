// app/api/me/claims/route.ts (Perbaikan Final)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";
// FIX: Hapus impor 'EligibilityStatus' karena tidak ada.

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAppSession();
    if (!session?.user?.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWallet = session.user.address.toLowerCase();

    const claimableRecords = await prisma.eligibilityRecord.findMany({
      where: {
        userWalletAddress: userWallet,
        // FIX: Gunakan string literal "ELIGIBLE" secara langsung.
        status: "ELIGIBLE", 
      },
      include: {
        credential: {
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