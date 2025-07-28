// File: lib/server/verify.ts

"use server";

import { prisma } from "@/lib/server/prisma";
// Mengimpor enum yang benar dan final dari Prisma client
import { VerificationStatus, VerifiedSbtClaimStatus } from "@prisma/client";

export type VerifyStatus = {
  registered: boolean;
  requested: boolean;
  approved: boolean;
  claimed: boolean;
  sbtCid?: string | null;
};

export async function getVerifyStatus(address: `0x${string}`): Promise<VerifyStatus> {
  try {
    const lowercasedAddress = address.toLowerCase();

    const entity = await prisma.verifiedEntity.findUnique({
      where: { walletAddress: lowercasedAddress },
      include: {
        sbtClaimProcess: true,
      },
    });

    if (!entity) {
      return { registered: false, requested: false, approved: false, claimed: false };
    }

    const claimProcess = entity.sbtClaimProcess;

    // DEBUG: Log data untuk debugging
    console.log("DEBUG - Entity data:", {
      entityStatus: entity.status,
      claimProcessExists: !!claimProcess,
      claimProcessStatus: claimProcess?.status,
    });

    const result = {
      // Seharusnya hanya true jika status = REGISTERED (sudah diapprove admin)
      registered: entity.status === VerificationStatus.REGISTERED,
      
      // Hanya true jika ada claimProcess DAN statusnya bukan NOT_REQUESTED
      requested: claimProcess ? claimProcess.status !== VerifiedSbtClaimStatus.NOT_REQUESTED : false,
      
      // Hanya true jika claimProcess sudah APPROVED atau CLAIMED
      approved:
        claimProcess?.status === VerifiedSbtClaimStatus.APPROVED ||
        claimProcess?.status === VerifiedSbtClaimStatus.CLAIMED,
      
      // Hanya true jika claimProcess sudah CLAIMED
      claimed: claimProcess?.status === VerifiedSbtClaimStatus.CLAIMED,

      sbtCid: claimProcess?.cid, 
    };

    // DEBUG: Log hasil untuk debugging
    console.log("DEBUG - Result:", result);

    return result;
  } catch (err) {
    console.error("[getVerifyStatus] error:", err);
    return { registered: false, requested: false, approved: false, claimed: false };
  }
}