import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";

export async function GET(req: Request, { params }: { params: { campaignId: string } }) {
  try {
    const { user } = await getAuth();
    if (!user?.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Menggunakan `campaignId` untuk merujuk pada `templateId`
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
    
    const eligibleWallets = campaign.eligibilityList.map(item => item.userWalletAddress);
    if (!eligibleWallets.includes(user.address)) {
      return NextResponse.json({ error: "Anda tidak berhak untuk kampanye ini" }, { status: 403 });
    }

    const leaves = eligibleWallets.map(addr => keccak256(addr));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    
    const leaf = keccak256(user.address);
    const proof = tree.getHexProof(leaf);

    return NextResponse.json({ proof });
  } catch (error) {
    console.error("Error generating proof:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}