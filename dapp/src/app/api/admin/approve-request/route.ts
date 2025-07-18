// /app/api/admin/approve-institution/route.ts

import { prisma } from "@/lib/server/prisma"; // asumsi kamu sudah punya instance prisma
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { id } = body;

  const institution = await prisma.institutionRequest.findUnique({ where: { id } });
  if (!institution) {
    return NextResponse.json({ error: "Institution not found" }, { status: 404 });
  }

  // 1. Simpan ke InstitutionList
  await prisma.institutionList.create({
    data: {
      name: institution.name,
      officialWebsite: institution.officialWebsite,
      contactEmail: institution.contactEmail,
      institutionType: institution.institutionType,
      walletAddress: institution.walletAddress,
    },
  });

  // 2. Hapus dari InstitutionRequest
  await prisma.institutionRequest.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
