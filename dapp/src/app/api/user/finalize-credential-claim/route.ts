// File: app/api/user/finalize-credential-claim/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";

export async function POST(req: Request) {
  try {
    // 1. Otentikasi & Otorisasi
    const { user } = await getAuth();
    if (!user?.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId, txHash } = await req.json();
    if (!templateId || !txHash) {
      return NextResponse.json({ error: "Template ID or Transaction Hash is missing" }, { status: 400 });
    }

    // 2. Cari record kelayakan yang sesuai
    const eligibilityRecord = await prisma.eligibilityRecord.findUnique({
      where: {
        templateId_userWalletAddress: {
          templateId: templateId,
          userWalletAddress: user.address,
        },
      },
    });

    // 3. Pastikan record ada dan statusnya ELIGIBLE
    if (!eligibilityRecord || eligibilityRecord.status !== "ELIGIBLE") {
      return NextResponse.json({ error: "No eligible record found to claim" }, { status: 404 });
    }

    // 4. Update status menjadi CLAIMED
    await prisma.eligibilityRecord.update({
      where: {
        id: eligibilityRecord.id,
      },
      data: {
        status: "CLAIMED",
      },
    });

    // Catatan: Pembuatan entri di `CuratedSbt` akan ditangani oleh Event Listener
    // untuk memastikan sinkronisasi yang lebih andal.

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[POST /api/user/finalize-credential-claim]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
