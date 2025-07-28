import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";

export async function GET() {
  try {
    const { user } = await getAuth();
    if (!user?.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWallet = user.address.toLowerCase();

    // KUNCI: Query ini sekarang akan berhasil karena `saveClaimCampaignAction`
    // telah membuat `EligibilityRecord` yang diperlukan.
    const claimableRecords = await prisma.eligibilityRecord.findMany({
      where: {
        userWalletAddress: userWallet,
        status: "ELIGIBLE",
        template: {
          templateType: 'CREDENTIAL'
        }
      },
      include: {
        // Sertakan detail dari template yang bisa diklaim
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