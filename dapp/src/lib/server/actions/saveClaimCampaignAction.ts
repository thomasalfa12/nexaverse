"use server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";
import { revalidatePath } from "next/cache";

interface SaveResult { success: boolean; error?: string; }
interface CampaignData {
  title: string;
  contractAddress: string;
  merkleRoot: string;
  metadataUri: string;
  eligibleWallets: string[];
}

export async function saveClaimCampaignAction(data: CampaignData): Promise<SaveResult> {
    try {
        const { user } = await getAuth();
        if (!user?.address || !user.entityId) return { success: false, error: "Unauthorized" };

        await prisma.claimCampaign.create({
            data: {
                title: data.title,
                contractAddress: data.contractAddress,
                merkleRoot: data.merkleRoot,
                metadataUri: data.metadataUri,
                creatorId: user.entityId,
                eligibleWallets: data.eligibleWallets
            }
        });
        revalidatePath("/dashboard/claims");
        return { success: true };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}