// src/app/api/request/mint/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

    const existing = await prisma.sBTRequest.findUnique({
      where: { Address: address },
    });

    if (existing) {
      return NextResponse.json({ message: "Request already exists" });
    }

    await prisma.sBTRequest.create({
      data: { Address: address },
    });

    return NextResponse.json({ message: "Mint request submitted" });
  } catch (error) {
    console.error("[POST /api/request/mint]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
