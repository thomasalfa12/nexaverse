// src/app/api/admin/signed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenId, to, uri, deadline, signature } = body;

    if (!tokenId || !to || !uri || !deadline || !signature) {
      return NextResponse.json(
        { error: "Incomplete signature payload" },
        { status: 400 }
      );
    }

    const exists = await prisma.sBTSignature.findUnique({
      where: { tokenId: tokenId.toString() },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Signature for this tokenId already exists" },
        { status: 409 }
      );
    }

    await prisma.sBTSignature.create({
      data: {
        tokenId: tokenId.toString(), // pastikan sebagai string
        to,
        uri,
        deadline: deadline.toString(), // simpan sebagai string agar kompatibel di DB
        signature,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/admin/signed] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const signatures = await prisma.sBTSignature.findMany();
    return NextResponse.json(signatures ?? []); // fallback array jika null
  } catch (err) {
    console.error("[GET /api/admin/signed] Error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
