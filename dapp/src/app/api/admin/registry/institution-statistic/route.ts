// src/app/api/institution/statistics/route.ts
import { prisma } from "@/lib/server/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const total = await prisma.institutionList.count();

    // Contoh lain jika kamu tambahkan kolom tipe institusi atau status, bisa dihitung di sini
    return NextResponse.json({
      total,
    });
  } catch (err) {
    console.error("[GET /institution/statistics]", err);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
