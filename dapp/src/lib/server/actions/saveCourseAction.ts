"use server";

import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";
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
        const session = await getAppSession();
        if (!session?.user?.address || !session.user.entityId) {
            return { success: false, error: "Unauthorized" };
        }
        await prisma.course.create({ // GANTI DI SINI
    data: {
        // templateType: 'COURSE', // Hapus baris ini
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        contractAddress: data.contractAddress.toLowerCase(),
        creatorId: session.user.entityId,
        status: 'DRAFT', // Atau DRAFT sesuai kebutuhan
        category: data.category,
        pricing: {
            create: {
                type: data.price > 0 ? 'ONE_TIME' : 'FREE',
                price: data.price,
                currency: 'ETH'
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