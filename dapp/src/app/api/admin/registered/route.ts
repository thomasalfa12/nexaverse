// src/app/api/admin/registered/route.ts

import { prisma } from "@/lib/server/prisma";
import { NextResponse } from "next/server";
import { getPublicClient } from "@wagmi/core";
import { contracts } from "@/lib/contracts";
import { wagmiConfig } from "@/lib/wallet"; // wagmi config kamu sendiri

export async function GET() {
  try {
    const allInstitutions = await prisma.institutionList.findMany();

    const publicClient = getPublicClient(wagmiConfig); // ✅ berikan config Wagmi kamu

    const verifiedInstitutions = await Promise.all(
      allInstitutions.map(async (inst) => {
        try {
          const isRegistered = await publicClient.readContract({
            address: contracts.registry.address,
            abi: contracts.registry.abi,
            functionName: "isRegisteredInstitution",
            args: [inst.walletAddress],
          });

          // Hanya kembalikan inst jika benar-benar terdaftar di on-chain
          return isRegistered ? inst : null;
        } catch (err) {
          console.warn(`[checkOnChain] Failed for ${inst.walletAddress}`, err);
          return null;
        }
      })
    );

    const filtered = verifiedInstitutions.filter(Boolean);
    return NextResponse.json(filtered);
  } catch (err) {
    console.error("[GET /admin/registered]", err);
    return NextResponse.json(
      { error: "Failed to fetch registered institutions" },
      { status: 500 }
    );
  }
}
