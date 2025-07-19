import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { SbtStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { address, txHash } = await req.json();
    if (!address || !txHash) {
      return NextResponse.json({ error: "Missing address or txHash" }, { status: 400 });
    }

    const institution = await prisma.institution.findUnique({
      where: { walletAddress: address },
    });

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    const existingRequest = await prisma.sbtMint.findUnique({
      where: { institutionId: institution.id },
    });

    if (existingRequest) {
      return NextResponse.json({ message: "Request already exists" }, { status: 409 });
    }

    await prisma.sbtMint.create({
      data: {
        institutionId: institution.id,
        status: SbtStatus.PENDING,
        requestTxHash: txHash, // Simpan bukti transaksi
      },
    });

    return NextResponse.json({ message: "Mint request recorded" });
  } catch (error) {
    console.error("[POST /api/user/request-mint]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
