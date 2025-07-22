// File: app/api/admin/registry/register-institution/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
// SINKRONISASI: Menggunakan enum yang benar
import { VerificationStatus } from "@prisma/client";

// FUNGSI GET DIHAPUS DARI FILE INI KARENA SUDAH DITANGANI OLEH `pending-requests`

// POST: Menyimpan permintaan verifikasi baru dari pengguna
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // SINKRONISASI: Menggunakan nama field yang benar (primaryUrl, entityType)
    const { name, primaryUrl, contactEmail, entityType, walletAddress } = body;

    if (!name || !primaryUrl || !contactEmail || !walletAddress || !entityType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // SINKRONISASI: Menggunakan model `verifiedEntity`
    const exists = await prisma.verifiedEntity.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (exists) {
      return NextResponse.json({ error: "Wallet address already submitted" }, { status: 409 });
    }

    // SINKRONISASI: Membuat entri di model `verifiedEntity`
    const newEntity = await prisma.verifiedEntity.create({
      data: {
        name,
        primaryUrl,
        contactEmail,
        entityType,
        walletAddress: walletAddress.toLowerCase(),
        status: VerificationStatus.PENDING, // Status awal
      },
    });

    return NextResponse.json(newEntity);
  } catch (err) {
    console.error("POST /api/admin/registry/register-institution error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}