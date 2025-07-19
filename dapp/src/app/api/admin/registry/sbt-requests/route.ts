// File: app/api/admin/registry/sbt-requests/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

/**
 * GET: Mengambil semua permintaan mint SBT.
 *
 * Fungsi ini menggunakan Prisma `include` untuk secara otomatis
 * menggabungkan data dari tabel `Institution` yang berelasi.
 * Hasilnya akan cocok dengan tipe `SbtMintWithInstitution` yang diharapkan
 * oleh komponen frontend.
 */
export async function GET() {
  try {
    const sbtRequests = await prisma.sbtMint.findMany({
      // Ini adalah bagian terpenting:
      // 'include' memberi tahu Prisma untuk mengambil data 'institution'
      // yang terhubung melalui relasi di skema.
      include: {
        institution: true,
      },
      // Urutkan berdasarkan permintaan terbaru untuk pengalaman admin yang lebih baik.
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Kirim kembali data gabungan sebagai respons.
    return NextResponse.json(sbtRequests);

  } catch (err) {
    console.error("[GET /api/admin/registry/sbt-requests]", err);
    return NextResponse.json(
      { error: "Failed to fetch SBT mint requests" },
      { status: 500 }
    );
  }
}
