// /api/admin/approve.ts
import { prisma } from "@/lib/server/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, tokenId, uri } = body;

    if (!address || !uri) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update uri pada SBTRequest
    await prisma.sBTRequest.update({
      where: { Address: address },
      data: { 
        uri,
        approved:true, 
      },
    });

    // Tambahkan juga entri ke tabel approval (jika kamu punya SBTApproval misalnya)
    await prisma.sBTApproval.create({
      data: {
        tokenId,
        address,
        uri,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/admin/registry/approve]", error);
    return NextResponse.json({ error: "Approval failed" }, { status: 500 });
  }
}
