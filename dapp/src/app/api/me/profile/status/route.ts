import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { user } = await getAuth();
    if (!user?.address) {
      return NextResponse.json({ hasProfile: false, error: "Unauthorized" });
    }

    const profile = await prisma.profile.findUnique({
      where: { walletAddress: user.address.toLowerCase() },
      select: { id: true } // Hanya periksa keberadaannya
    });

    return NextResponse.json({ hasProfile: !!profile });
  } catch  {
    return NextResponse.json({ hasProfile: false, error: "Internal Server Error" });
  }
}