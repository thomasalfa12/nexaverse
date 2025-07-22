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
        sbtClaimProcess: true, // Sertakan data proses klaim SBT
      },
    });

    if (!entity) {
      return { registered: false, requested: false, approved: false, claimed: false };
    }

    const claimProcess = entity.sbtClaimProcess;

  return {
      // 'registered' jika status verifikasi entitas adalah REGISTERED.
      registered: entity.status === VerificationStatus.REGISTERED,
      
      // 'requested' jika proses klaim sudah dimulai (statusnya bukan NOT_REQUESTED lagi).
      requested: claimProcess?.status !== VerifiedSbtClaimStatus.NOT_REQUESTED,
      
      // 'approved' jika status proses klaim adalah APPROVED atau sudah melewatinya (CLAIMED).
      approved:
        claimProcess?.status === VerifiedSbtClaimStatus.APPROVED ||
        claimProcess?.status === VerifiedSbtClaimStatus.CLAIMED,
      
      // 'claimed' jika status proses klaim adalah CLAIMED.
      claimed: claimProcess?.status === VerifiedSbtClaimStatus.CLAIMED,

      // Teruskan CID untuk pratinjau di langkah klaim.
      sbtCid: claimProcess?.cid, 
    };
  } catch (err) {
    console.error("[getVerifyStatus] error:", err);
    return { registered: false, requested: false, approved: false, claimed: false };
  }
}
