// app/api/me/[campaignId]/profile/route.ts

import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
// GANTI: Impor helper sesi yang benar
import { getAppSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { campaignId: string } }) {
  try {
    // GANTI: Gunakan getAppSession untuk mendapatkan data sesi
    const session = await getAppSession();
    
    // Sesuaikan pengecekan dengan objek sesi yang baru
    if (!session?.user?.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userAddress = session.user.address;

    const campaign = await prisma.credentialTemplate.findUnique({
      where: { id: params.campaignId },
      include: {
        eligibilityList: {
          select: { userWalletAddress: true }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Kampanye tidak ditemukan" }, { status: 404 });
    }
    
    const eligibleWallets = campaign.eligibilityList.map(item => item.userWalletAddress.toLowerCase());
    if (!eligibleWallets.includes(userAddress.toLowerCase())) {
      return NextResponse.json({ error: "Anda tidak berhak untuk kampanye ini" }, { status: 403 });
    }

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