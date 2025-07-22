// File: app/api/admin/registry/finalize-registration/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { VerificationStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    // SINKRONISASI: Menggunakan nama variabel yang lebih jelas (`entityId`)
    const { entityId, txHash } = await req.json();

    if (!entityId || !txHash) {
      return NextResponse.json({ error: "Missing entityId or txHash" }, { status: 400 });
    }

    const updatedEntity = await prisma.verifiedEntity.update({
      where: { id: Number(entityId) },
      data: {
        status: VerificationStatus.REGISTERED,
        registrationTxHash: txHash,
        registeredAt: new Date(),
      },
    });

    return NextResponse.json(updatedEntity);
  } catch (err) {
    console.error("POST /finalize-registration error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
