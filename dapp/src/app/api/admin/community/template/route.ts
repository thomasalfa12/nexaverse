import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/server/prisma";

export const dynamic = 'force-dynamic';

interface DecodedToken { address: string; roles: string[]; }

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("nexa_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    if (!decoded.roles.includes("VERIFIED_ENTITY")) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const creator = await prisma.verifiedEntity.findUnique({
      where: { walletAddress: decoded.address },
      select: { id: true },
    });
    if (!creator) {
      return NextResponse.json({ error: "Entitas kreator tidak ditemukan" }, { status: 404 });
    }

    const templates = await prisma.credentialTemplate.findMany({
      where: { creatorId: creator.id },
      include: {
        // FIX UTAMA: Menyertakan data modul untuk setiap template.
        modules: {
          orderBy: { stepNumber: 'asc' }
        },
        _count: {
          select: {
            eligibilityList: true,
            issuedCredentials: true,
            enrollments: true,
          },
        },
        creator: { select: { name: true } },
        pricing: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Gagal mengambil data template:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}