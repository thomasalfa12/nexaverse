// src/app/api/admin/signed/[address]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address?.toLowerCase();
    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

    const data = await prisma.sBTSignature.findMany({
      where: { to: address },
    });

    const serialized = data.map((item) => ({
      ...item,
      tokenId: item.tokenId.toString(),
      deadline: item.deadline.toString(),
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    console.error("[GET /api/admin/signed/[address]] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
