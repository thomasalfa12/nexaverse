// File: app/api/user/finalize-credential-claim/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
// 1. GANTI: Impor helper sesi yang benar
import { getAppSession } from "@/lib/auth";
import { z } from "zod";

// Skema untuk memvalidasi data yang masuk
const finalizeClaimSchema = z.object({
  templateId: z.string().cuid("Template ID tidak valid."),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Format Transaction Hash tidak valid."),
});

export async function POST(req: Request) {
  try {
    // 1. Otentikasi & Otorisasi menggunakan NextAuth.js
    const session = await getAppSession();
    if (!session?.user?.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validasi input body
    const body = await req.json();
    const validation = finalizeClaimSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json({ error: "Data tidak valid", details: validation.error.flatten() }, { status: 400 });
    }
    const { templateId } = validation.data;

    // 3. Cari record kelayakan yang sesuai
    const eligibilityRecord = await prisma.eligibilityRecord.findUnique({
      where: {
        templateId_userWalletAddress: {
          templateId: templateId,
          userWalletAddress: session.user.address,
        },
      },
    });

    // 4. Pastikan record ada dan statusnya ELIGIBLE
    if (!eligibilityRecord || eligibilityRecord.status !== "ELIGIBLE") {
      return NextResponse.json({ error: "Tidak ditemukan data yang berhak untuk diklaim." }, { status: 404 });
    }

    // 5. Update status menjadi CLAIMED
    await prisma.eligibilityRecord.update({
      where: {
        id: eligibilityRecord.id,
      },
      data: {
        status: "CLAIMED",
        // Anda bisa menyimpan txHash di sini jika ada kolomnya
      },
    });

    // Catatan: Pembuatan entri di `CuratedCredential` akan ditangani oleh Event Listener
    // untuk memastikan sinkronisasi yang lebih andal.

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[POST /api/user/finalize-credential-claim]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
