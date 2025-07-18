// /app/api/admin/institution-list/route.ts
import { prisma } from "@/lib/server/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const institutions = await prisma.institutionList.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(institutions);
}
