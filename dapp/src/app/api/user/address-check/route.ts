import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
// SINKRONISASI: Menggunakan enum `VerificationStatus` yang benar
import { VerificationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
    }

    const address = wallet.toLowerCase();

    // SINKRONISASI: Menggunakan model `verifiedEntity`
    const entity = await prisma.verifiedEntity.findUnique({
      where: { walletAddress: address },
      select: {
        status: true, // Hanya butuh statusnya
      },
    });

    if (!entity) {
      return NextResponse.json({
        submitted: false,
        registered: false,
      });
    }

    return NextResponse.json({
      submitted: true,
      registered: entity.status === VerificationStatus.REGISTERED,
    });
  } catch (err) {
    console.error("[GET /api/user/address-check]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}