import { prisma } from "@/lib/server/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const approvals = await prisma.sBTApproval.findMany({
      select: { address: true },
    });

    return NextResponse.json(approvals);
  } catch (error) {
    console.error("[GET /api/admin/signed]", error);
    return NextResponse.json({ error: "Failed to fetch signed approvals" }, { status: 500 });
  }
}
