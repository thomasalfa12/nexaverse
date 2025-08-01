// File: app/api/user/eligibility-status/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
// 1. GANTI: Impor helper sesi yang benar
import { getAppSession } from "@/lib/auth";

/**
 * GET: Memeriksa status kelayakan pengguna yang sedang login
 * untuk semua kredensial yang ada.
 * Mengembalikan sebuah map: { templateId: "ELIGIBLE" | "CLAIMED" }
 */
export async function GET() {
  try {
    // 2. GANTI: Gunakan getAppSession untuk mendapatkan data sesi
    const session = await getAppSession();
    
    // 3. GANTI: Pengecekan sesi yang benar
    if (!session?.user?.address) {
      // Jika tidak ada pengguna, kembalikan objek kosong
      return NextResponse.json({});
    }

    const eligibilityRecords = await prisma.eligibilityRecord.findMany({
      where: {
        userWalletAddress: session.user.address,
      },
      select: {
        templateId: true,
        status: true,
      },
    });

    // Ubah array menjadi objek map untuk pencarian yang cepat di frontend
    const eligibilityMap = eligibilityRecords.reduce((acc, record) => {
      acc[record.templateId] = record.status;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(eligibilityMap);

  } catch (error) {
    console.error("[GET /api/user/eligibility-status]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
