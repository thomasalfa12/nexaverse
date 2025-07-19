import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { SbtStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { sbtMintId, uri, txHash } = await req.json();

    if (!sbtMintId || !uri || !txHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await prisma.sbtMint.update({
      where: { id: sbtMintId },
      data: {
        status: SbtStatus.APPROVED,
        uri: uri,
        approvalTxHash: txHash,
        approvedAt: new Date(),
        // Kita tidak menyimpan tokenId di sini karena itu dibuat saat `claim()`
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FINALIZE SBT APPROVAL]", error);
    return NextResponse.json({ error: "Finalization failed" }, { status: 500 });
  }
}
