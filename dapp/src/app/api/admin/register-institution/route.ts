import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

// GET: Ambil semua permintaan dari database
export async function GET() {
  try {
    const requests = await prisma.institutionRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch (err) {
    console.error("GET /api/admin/institutions error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Simpan permintaan baru ke database
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, officialWebsite, contactEmail, institutionType, walletAddress } = body;

    if (!name || !officialWebsite || !contactEmail || !walletAddress) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const exists = await prisma.institutionRequest.findUnique({
      where: { walletAddress },
    });

    if (exists) {
      return NextResponse.json({ error: "Already requested" }, { status: 409 });
    }

    const newReq = await prisma.institutionRequest.create({
      data: {
        name,
        officialWebsite,
        contactEmail,
        institutionType,
        walletAddress,
      },
    });

    return NextResponse.json(newReq);
  } catch (err) {
    console.error("POST /api/admin/institutions error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
