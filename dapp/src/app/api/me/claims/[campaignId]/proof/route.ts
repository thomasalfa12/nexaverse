// app/api/me/claims/[campaignId]/proof/route.ts (Sudah Diperbaiki)

import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { campaignId: string } }) {
  try {
    const session = await getAppSession();
    if (!session?.user?.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userAddress = session.user.address.toLowerCase();

    // FIX: Mengganti query ke model 'Credential'
    const campaign = await prisma.credential.findUnique({
      where: { id: params.campaignId },
      include: {
        // FIX: Ganti relasi dari 'eligibilityList' menjadi 'eligibilityRecords'
        eligibilityRecords: {
          select: { userWalletAddress: true }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Kampanye tidak ditemukan" }, { status: 404 });
    }
    
    // FIX: Ambil data wallet dari relasi yang benar
    const eligibleWallets = campaign.eligibilityRecords.map(item => item.userWalletAddress.toLowerCase());
    if (!eligibleWallets.includes(userAddress)) {
      return NextResponse.json({ error: "Anda tidak berhak untuk kampanye ini" }, { status: 403 });
    }

    // Logika Merkle Tree selanjutnya sudah benar
    const leaves = eligibleWallets.map(addr => keccak256(addr));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    
    const leaf = keccak256(userAddress);
    const proof = tree.getHexProof(leaf);

    return NextResponse.json({ proof });
  } catch (error) {
    console.error("Error generating proof:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}