// File: app/api/admin/registry/pending-requests/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { VerificationStatus } from "@prisma/client";

// GET: Mengambil semua entitas yang status verifikasinya masih PENDING.
export async function GET() {
  try {
    const pendingEntities = await prisma.verifiedEntity.findMany({
      where: {
        status: VerificationStatus.PENDING,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(pendingEntities);
  } catch (err) {
    console.error("[GET /pending-requests]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
