// File: app/api/admin/registry/finalize-sbt-approval/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
// SINKRONISASI: Menggunakan enum yang benar
import { VerifiedSbtClaimStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    // SINKRONISASI: Menggunakan nama variabel yang lebih jelas
    const { claimProcessId, cid, txHash } = await req.json();

    if (!claimProcessId || !cid || !txHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // SINKRONISASI: Menggunakan model dan enum yang benar
    await prisma.verifiedSbtClaimProcess.update({
      where: { id: claimProcessId },
      data: {
        status: VerifiedSbtClaimStatus.APPROVED,
        cid: cid,
        approvalTxHash: txHash,
        approvedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FINALIZE SBT APPROVAL]", error);
    return NextResponse.json({ error: "Finalization failed" }, { status: 500 });
  }
}
