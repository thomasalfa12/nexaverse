// File: app/api/admin/registry/sbt-requests/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { VerifiedSbtClaimStatus } from "@prisma/client";

// GET: Mengambil semua permintaan klaim lencana yang statusnya REQUESTED.
export async function GET() {
  try {
    // SINKRONISASI: Menggunakan model `verifiedSbtClaimProcess`
    const sbtRequests = await prisma.verifiedSbtClaimProcess.findMany({
      where: {
        status: VerifiedSbtClaimStatus.REQUESTED,
      },
      include: {
        entity: true, // Menggabungkan data dari `VerifiedEntity`
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(sbtRequests);
  } catch (err) {
    console.error("[GET /sbt-requests]", err);
    return NextResponse.json({ error: "Failed to fetch SBT requests" }, { status: 500 });
  }
}