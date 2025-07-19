import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { RegistrationStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { institutionId, txHash } = await req.json();

    if (!institutionId || !txHash) {
      return NextResponse.json({ error: "Missing institutionId or txHash" }, { status: 400 });
    }

    // Update status institusi yang ada
    const updatedInstitution = await prisma.institution.update({
      where: { id: Number(institutionId) },
      data: {
        status: RegistrationStatus.REGISTERED,
        registrationTxHash: txHash,
        registeredAt: new Date(),
      },
    });

    return NextResponse.json(updatedInstitution);
  } catch (err) {
    console.error("POST /api/admin/registry/finalize-registration error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
