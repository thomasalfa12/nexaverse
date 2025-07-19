// /app/api/institution/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { checkIsRegistered } from "@/lib/server/verify";

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");

  if (!wallet)
    return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });

  const address = wallet.toLowerCase();
  const institution = await prisma.institutionRequest.findUnique({
    where: { walletAddress: address },
  });

  const registered = await checkIsRegistered(address as `0x${string}`);

  return NextResponse.json({
    submitted: !!institution,
    registered,
  });
}
