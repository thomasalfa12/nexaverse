// File: app/api/discovery/templates/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

/**
 * GET: Mengambil semua Credential Templates yang tersedia untuk ditampilkan
 * di halaman Discovery.
 */
export async function GET() {
  try {
    const templates = await prisma.credentialTemplate.findMany({
      orderBy: {
        createdAt: "desc",
      },
      // Sertakan data kreator (VerifiedEntity) untuk setiap templat
      include: {
        creator: true,
        _count: {
          select: {
            issuedCredentials: true, // Untuk menampilkan berapa banyak yang sudah diterbitkan
          },
        },
      },
    });

    return NextResponse.json(templates);

  } catch (error) {
    console.error("[GET /api/discovery]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
