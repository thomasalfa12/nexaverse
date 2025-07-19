// /api/admin/mint-requests.ts
import { prisma } from "@/lib/server/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const requests = await prisma.sBTRequest.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        Address: true,
        uri: true,
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("[GET /api/admin/registry/mint-request]", error);
    return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 });
  }
}
