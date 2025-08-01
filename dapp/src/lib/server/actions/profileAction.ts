"use server";

import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const profileSchema = z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter." }).trim(),
  image: z.string().url("URL gambar tidak valid.").nullable().optional(),
  email: z.string().email("Format email tidak valid.").nullable().optional().or(z.literal("")),
  bio: z.string().max(160, "Bio maksimal 160 karakter.").trim().nullable().optional(),
});

interface ProfileResult {
  success: boolean;
  error?: string;
}

export async function createOrUpdateProfileAction(formData: FormData): Promise<ProfileResult> {
  console.log("\n--- [ACTION START] createOrUpdateProfileAction ---");
  
  const session = await getAppSession();
  if (!session?.user?.id) {
    console.error("[ACTION FAIL] Unauthorized: No session found.");
    return { success: false, error: "Unauthorized" };
  }
  console.log(`[ACTION LOG] Session found for user ID: ${session.user.id}`);

  const rawData = {
    name: formData.get("name"),
    image: formData.get("image"),
    email: formData.get("email"),
    bio: formData.get("bio"),
  };
  console.log("[ACTION LOG] Raw data from FormData:", rawData);

  const validation = profileSchema.safeParse(rawData);
  if (!validation.success) {
    console.error("[ACTION FAIL] Zod validation failed:", validation.error.flatten());
    return { success: false, error: validation.error.errors[0].message };
  }
  
  const { name, image, email, bio } = validation.data;
  console.log("[ACTION LOG] Validated data:", { name, image, email, bio });

  try {
    console.log(`[ACTION LOG] Attempting to update User table for ID: ${session.user.id}`);
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name,
        image: image,
        email: email,
        bio: bio,
      },
    });
    console.log("[ACTION LOG] Prisma update successful.");

    revalidatePath("/", "layout");
    console.log("--- [ACTION SUCCESS] ---");
    return { success: true };
    
  } catch (error) {
    console.error("!!! [ACTION FAIL] Caught an error during prisma.update:", error);
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        return { success: false, error: "Email ini sudah digunakan oleh akun lain." };
    }
    return { success: false, error: "Gagal menyimpan profil ke database." };
  }
}