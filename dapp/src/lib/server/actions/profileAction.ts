"use server";

import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";
import { revalidatePath } from "next/cache";

interface ProfileResult {
  success: boolean;
  error?: string;
}

export async function createOrUpdateProfileAction(formData: FormData): Promise<ProfileResult> {
  try {
    const { user } = await getAuth();
    if (!user?.address) {
      return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;

    if (!name || name.trim().length < 3) {
      return { success: false, error: "Nama harus diisi (minimal 3 karakter)." };
    }

    await prisma.profile.upsert({
      where: { walletAddress: user.address.toLowerCase() },
      update: {
        name: name,
        bio: bio,
      },
      create: {
        walletAddress: user.address.toLowerCase(),
        name: name,
        bio: bio,
      }
    });

    // Revalidate semua halaman setelah profil dibuat/diperbarui
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    return { success: false, error: "Gagal menyimpan profil." };
  }
}