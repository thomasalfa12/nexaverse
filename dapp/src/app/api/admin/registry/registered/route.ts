import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { RegistrationStatus } from "@prisma/client";

/**
 * GET: Mengambil semua institusi yang statusnya sudah 'REGISTERED' di database.
 * Pendekatan ini jauh lebih efisien karena tidak perlu melakukan panggilan on-chain
 * untuk setiap entri. Kita percaya pada status di DB kita karena status tersebut
 * hanya diatur setelah transaksi on-chain berhasil.
 */
export async function GET() {
  try {
    const registeredInstitutions = await prisma.institution.findMany({
      where: {
        // Cukup filter berdasarkan status di database
        status: RegistrationStatus.REGISTERED,
      },
      orderBy: {
        // Urutkan berdasarkan kapan mereka disetujui
        registeredAt: "desc",
      },
    });
    return NextResponse.json(registeredInstitutions);
  } catch (err) {
    console.error("[GET /api/admin/registry/registered]", err);
    return NextResponse.json(
      { error: "Failed to fetch registered institutions" },
      { status: 500 }
    );
  }
}