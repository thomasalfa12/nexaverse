import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { keccak256, toBytes } from "viem";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { contracts } from "@/lib/contracts";
import { readContract } from "viem/actions";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

// GET: List all SBT signature requests
export async function GET() {
  try {
    const data = await prisma.sBTRequest.findMany();

    // Serialize BigInt -> string for deadline
    const serialized = data.map((item) => ({
      ...item,
      deadline: item.deadline.toString(),
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    console.error("[GET /api/admin/requests] Error:", err);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

// POST: Submit a new SBT request
export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

    // Read on-chain institution data from registry
    const onchainData = await readContract(publicClient, {
      address: contracts.registry.address,
      abi: contracts.registry.abi,
      functionName: "getInstitutionDetails",
      args: [address],
    }) as {
      name: string;
      officialWebsite: string;
      contactEmail: string;
      institutionType: number;
      walletAddress: string;
      isRegistered: boolean;
      registrationDate: bigint;
    };

    // Generate metadata
    const metadata = {
      name: onchainData.name,
      officialWebsite: onchainData.officialWebsite,
      contactEmail: onchainData.contactEmail,
      institutionType: onchainData.institutionType,
      walletAddress: onchainData.walletAddress,
      issuedAt: Math.floor(Date.now() / 1000),
    };

    const uri = `data:application/json;base64,${Buffer.from(
      JSON.stringify(metadata)
    ).toString("base64")}`;

    const tokenId = keccak256(toBytes(address));
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7); // 7 days

    // Cek jika request dengan tokenId sudah ada
    const existing = await prisma.sBTRequest.findUnique({
      where: { tokenId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Request already exists" },
        { status: 409 }
      );
    }

    // Simpan ke database
    await prisma.sBTRequest.create({
      data: {
        to: address,
        tokenId,
        uri,
        deadline,
      },
    });

    // Kirim response yang sudah diserialisasi
    return NextResponse.json({
      tokenId,
      to: address,
      uri,
      deadline: deadline.toString(),
    });
  } catch (err) {
    console.error("[POST /api/admin/requests] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
