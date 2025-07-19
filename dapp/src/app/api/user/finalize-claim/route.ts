import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { SbtStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { address, txHash } = await req.json();
    if (!address || !txHash) {
      return NextResponse.json({ error: "Missing address or txHash" }, { status: 400 });
    }

    // Cari permintaan SbtMint yang terkait dengan alamat wallet ini
    // melalui relasi dengan Institution.
    const sbtRequest = await prisma.sbtMint.findFirst({
      where: {
        institution: {
          walletAddress: address,
        },
        // Pastikan kita hanya mengupdate permintaan yang sudah disetujui
        status: SbtStatus.APPROVED,
      },
    });

    if (!sbtRequest) {
      return NextResponse.json({ error: "No approved SBT request found for this address" }, { status: 404 });
    }

    // Update status menjadi CLAIMED dan simpan bukti transaksinya.
    await prisma.sbtMint.update({
      where: { id: sbtRequest.id },
      data: {
        status: SbtStatus.CLAIMED,
        claimTxHash: txHash,
        claimedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "Claim successfully recorded." });
  } catch (error) {
    console.error("[POST /api/user/finalize-claim]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
