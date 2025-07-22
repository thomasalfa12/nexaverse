// File: app/api/admin/registry/registered/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { VerificationStatus } from "@prisma/client";

// GET: Mengambil semua entitas yang status verifikasinya sudah REGISTERED.
export async function GET() {
  try {
    const registeredEntities = await prisma.verifiedEntity.findMany({
      where: {
        status: VerificationStatus.REGISTERED,
      },
      orderBy: {
        registeredAt: "desc",
      },
    });
    return NextResponse.json(registeredEntities);
  } catch (err) {
    console.error("[GET /registered]", err);
    return NextResponse.json({ error: "Failed to fetch registered entities" }, { status: 500 });
  }
}
