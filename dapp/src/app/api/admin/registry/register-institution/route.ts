import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { RegistrationStatus } from "@prisma/client";

// GET: Ambil semua permintaan yang masih PENDING
export async function GET() {
  try {
    const requests = await prisma.institution.findMany({
      where: { status: RegistrationStatus.PENDING }, // Filter berdasarkan status
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch (err) {
    console.error("GET /api/admin/registry/institutions error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Simpan permintaan baru sebagai PENDING
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, officialWebsite, contactEmail, institutionType, walletAddress } = body;

    if (!name || !officialWebsite || !contactEmail || !walletAddress) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const exists = await prisma.institution.findUnique({
      where: { walletAddress },
    });

    if (exists) {
      return NextResponse.json({ error: "Wallet address already submitted" }, { status: 409 });
    }

    // Buat entri di model Institution yang baru
    const newInstitution = await prisma.institution.create({
      data: {
        name,
        officialWebsite,
        contactEmail,
        institutionType,
        walletAddress,
        status: RegistrationStatus.PENDING, // Status default
      },
    });

    return NextResponse.json(newInstitution);
  } catch (err) {
    console.error("POST /api/admin/registry/institutions error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}