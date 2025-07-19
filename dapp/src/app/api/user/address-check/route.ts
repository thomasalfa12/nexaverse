import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { RegistrationStatus } from "@prisma/client";

/**
 * GET: Memeriksa status pendaftaran sebuah alamat wallet.
 *
 * FIX: Logika ini sekarang sepenuhnya off-chain dan hanya mengandalkan
 * database sebagai sumber kebenaran, membuatnya sangat cepat dan konsisten
 * dengan fungsi `getVerifyStatus`.
 */
export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
    }

    const address = wallet.toLowerCase();

    // Cukup lakukan SATU panggilan ke database untuk mendapatkan semua info.
    const institution = await prisma.institution.findUnique({
      where: { walletAddress: address },
      select: {
        status: true, // Kita hanya butuh statusnya
      },
    });

    // Jika tidak ada entri, berarti belum pernah submit.
    if (!institution) {
      return NextResponse.json({
        submitted: false,
        registered: false,
      });
    }

    // Kembalikan status berdasarkan data dari database.
    return NextResponse.json({
      submitted: true, // 'submitted' jika ada entri di database.
      registered: institution.status === RegistrationStatus.REGISTERED, // 'registered' jika statusnya REGISTERED.
    });

  } catch (err) {
    console.error("[GET /api/user/address-check]", err);
    // Jika terjadi error database, kirim respons error JSON yang jelas.
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}