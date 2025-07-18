"use server";

import { baseSepolia } from "viem/chains";
import { contracts } from "@/lib/contracts";
import { prisma } from "@/lib/server/prisma";
import { createPublicClient, http } from "viem";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export type VerifyStatus = {
  registered: boolean;
  requested: boolean;
  approved: boolean;
  claimed: boolean;
};

type MintRequest = {
  approved: boolean;
  claimed: boolean;
  uri: string;
};

export async function getVerifyStatus(address: `0x${string}`): Promise<VerifyStatus> {
  try {
    const [registered, requested, mintRequest] = await Promise.all([
      checkIsRegistered(address),
      checkMintRequested(address),
      getMintRequestStatus(address),
    ]);

    return {
      registered,
      requested,
      approved: mintRequest?.approved ?? false,
      claimed: mintRequest?.claimed ?? false,
    };
  } catch (err) {
    console.error("[getVerifyStatus] error:", err);
    return {
      registered: false,
      requested: false,
      approved: false,
      claimed: false,
    };
  }
}

export async function checkIsRegistered(address: `0x${string}`): Promise<boolean> {
  try {
    const result = await publicClient.readContract({
      address: contracts.registry.address,
      abi: contracts.registry.abi,
      functionName: "isRegisteredInstitution",
      args: [address],
    });
    return Boolean(result);
  } catch (err) {
    console.error("[checkIsRegistered]", err);
    return false;
  }
}

async function checkMintRequested(address: `0x${string}`): Promise<boolean> {
  try {
    const request = await prisma.sBTRequest.findUnique({
      where: { Address: address },
    });
    return !!request;
  } catch (err) {
    console.error("[checkMintRequested]", err);
    return false;
  }
}

async function getMintRequestStatus(address: `0x${string}`): Promise<MintRequest | null> {
  try {
    // ambil approval info dari DB
    const approval = await prisma.sBTApproval.findFirst({
      where: {
        address: address.toLowerCase(),
      },
      select: {
        uri: true,
      },
    });

    // ambil status approved dari request table
    const request = await prisma.sBTRequest.findUnique({
      where: {
        Address: address,
      },
      select: {
        approved: true,
      },
    });

    if (!request) return null;

    // cek apakah sudah diklaim
    let claimed = false;

    try {
      const balance = await publicClient.readContract({
        address: contracts.institution.address,
        abi: contracts.institution.abi,
        functionName: "balanceOf",
        args: [address],
      }) as bigint;

      claimed = BigInt(balance) > 0n;
    } catch (err) {
      console.warn("[getMintRequestStatus] balanceOf failed", err);
      claimed = false;
    }

    return {
      approved: request.approved,
      uri: approval?.uri ?? "",
      claimed,
    };
  } catch (err) {
    console.error("[getMintRequestStatus]", err);
    return null;
  }
}



