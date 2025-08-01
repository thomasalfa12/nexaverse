"use server";

import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface SaveResult { success: boolean; error?: string; }
interface CourseData {
  title: string;
  description: string;
  imageUrl: string;
  contractAddress: string;
  price: number;
  category: string; 
}

export async function saveCourseAction(data: CourseData): Promise<SaveResult> {
    try {
        const { user } = await getAuth();
        if (!user?.address || !user.entityId) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.credentialTemplate.create({
            data: {
                templateType: 'COURSE',
                title: data.title,
                description: data.description,
                imageUrl: data.imageUrl,
                contractAddress: data.contractAddress.toLowerCase(),
                creatorId: user.entityId,
                status: 'DRAFT', // Kursus dimulai sebagai draft
                category: data.category,
                pricing: {
                    create: {
                        type: data.price > 0 ? 'ONE_TIME' : 'FREE',
                        price: data.price,
                        currency: 'ETH' // Asumsi pembayaran dalam ETH
                    }
                },
            }
        });

        revalidatePath("/dashboard/admin/verifiedUser");
        return { success: true };
    } catch (err) {
        console.error("Error saving course:", err);
        return { success: false, error: (err as Error).message };
    }
}