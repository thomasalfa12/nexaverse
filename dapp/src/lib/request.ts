// file: lib/actions/request.ts

import { prisma } from "@/lib/server/prisma";

export async function sendMintRequest( Address: string) {
  try {
    const existing = await prisma.sBTRequest.findUnique({
      where: { Address },
    });

    if (existing) {
      return {
        success: false,
        message: "Permintaan sudah diajukan sebelumnya.",
      };
    }

    await prisma.sBTRequest.create({
      data: { Address },
    });

    return { success: true };
  } catch (error) {
    console.error("[sendMintRequest]", error);
    return {
      success: false,
      message: "Terjadi kesalahan server.",
    };
  }
}
