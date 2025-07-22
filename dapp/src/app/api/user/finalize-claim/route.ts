import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
// SINKRONISASI: Menggunakan enum `VerifiedSbtClaimStatus` yang benar
import { VerifiedSbtClaimStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { address, txHash } = await req.json();
    if (!address || !txHash) {
      return NextResponse.json({ error: "Missing address or txHash" }, { status: 400 });
    }

    // SINKRONISASI: Menggunakan model `verifiedSbtClaimProcess` dan relasi yang benar
    const sbtRequest = await prisma.verifiedSbtClaimProcess.findFirst({
      where: {
        entity: {
          walletAddress: address.toLowerCase(),
        },
        status: VerifiedSbtClaimStatus.APPROVED,
      },
    });

    if (!sbtRequest) {
      return NextResponse.json({ error: "No approved SBT request found for this address" }, { status: 404 });
    }

    await prisma.verifiedSbtClaimProcess.update({
      where: { id: sbtRequest.id },
      data: {
        status: VerifiedSbtClaimStatus.CLAIMED,
        claimTxHash: txHash,
        claimedAt: new Date(), // Field ini sekarang ada di skema
      },
    });

    return NextResponse.json({ success: true, message: "Claim successfully recorded." });
  } catch (error) {
    console.error("[POST /api/user/finalize-claim]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}