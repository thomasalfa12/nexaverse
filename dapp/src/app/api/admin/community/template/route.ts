// File: app/api/community/templates/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";

// GET: Mengambil semua templat yang dimiliki oleh pengguna yang login
export async function GET() {
  try {
    // FIX: Memanggil getAuth() tanpa argumen
    const { user } = await getAuth();
    if (!user?.address || !user.roles.includes("VERIFIED_ENTITY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entity = await prisma.verifiedEntity.findUnique({
      where: { walletAddress: user.address },
    });

    if (!entity) {
      return NextResponse.json({ error: "Verified entity not found" }, { status: 404 });
    }

    const templates = await prisma.credentialTemplate.findMany({
      where: { creatorId: entity.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            eligibilityList: true,
            // FIX: Nama relasi yang benar adalah `issuedCredentials`
            issuedCredentials: true,
          },
        },
      },
    });

    // Mengubah nama field agar konsisten dengan frontend
    const formattedTemplates = templates.map(t => ({
      ...t,
      _count: {
        eligibilityList: t._count.eligibilityList,
        issuedSbts: t._count.issuedCredentials,
      }
    }));

    return NextResponse.json(formattedTemplates);

  } catch (error) {
    console.error("[GET /api/community/template]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Membuat templat kredensial baru
export async function POST(req: Request) {
  try {
    // FIX: Memanggil getAuth() tanpa argumen
    const { user } = await getAuth();
    if (!user?.address || !user.roles.includes("VERIFIED_ENTITY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entity = await prisma.verifiedEntity.findUnique({
      where: { walletAddress: user.address },
    });
    if (!entity) {
      return NextResponse.json({ error: "Verified entity not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, imageUrl, contractAddress } = body;

    if (!title || !description || !imageUrl || !contractAddress) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTemplate = await prisma.credentialTemplate.create({
        data: {
            title,
            description,
            imageUrl,
            contractAddress,
            creatorId: entity.id
        }
    });

    return NextResponse.json(newTemplate);

  } catch (error) {
    console.error("[POST /api/community/template]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
