import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";

export async function GET(req: Request) {
  try {
    const { user } = await getAuth();
    if (!user?.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FIX: Menggunakan model `EligibilityRecord` yang lebih efisien dan
    // kompatibel dengan semua database, termasuk MySQL.
    const claimableRecords = await prisma.eligibilityRecord.findMany({
      where: {
        userWalletAddress: user.address,
        status: "ELIGIBLE",
        // Pastikan kita hanya mengambil dari kampanye kredensial, bukan kursus
        template: {
          templateType: 'CREDENTIAL',
        },
      },
      include: {
        // Sertakan detail dari kredensial yang bisa diklaim
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