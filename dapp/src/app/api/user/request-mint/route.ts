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

    // SINKRONISASI: Menggunakan model `verifiedEntity`
    const entity = await prisma.verifiedEntity.findUnique({
      where: { walletAddress: address.toLowerCase() },
    });

    if (!entity) {
      return NextResponse.json({ error: "Verified entity not found" }, { status: 404 });
    }

    // SINKRONISASI: Menggunakan model `verifiedSbtClaimProcess`
    const existingRequest = await prisma.verifiedSbtClaimProcess.findUnique({
      where: { entityId: entity.id },
    });

    if (existingRequest) {
      return NextResponse.json({ message: "Request already exists" }, { status: 409 });
    }

    await prisma.verifiedSbtClaimProcess.create({
      data: {
        entityId: entity.id,
        status: VerifiedSbtClaimStatus.REQUESTED, // Status diubah menjadi REQUESTED
        requestTxHash: txHash,
      },
    });

    return NextResponse.json({ message: "Mint request recorded" });
  } catch (error) {
    console.error("[POST /api/user/request-mint]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}