"use server";

import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/server/pusher";

const profileSchema = z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter." }).trim(),
  image: z.string().url("URL gambar tidak valid.").nullable().optional(),
  email: z.string().email("Format email tidak valid.").nullable().optional().or(z.literal("")),
});

interface ProfileResult {
  success: boolean;
  error?: string;
}

export async function createOrUpdateProfileAction(formData: FormData): Promise<ProfileResult> {
  console.log("ACTION: 🚀 Memulai createOrUpdateProfileAction");
  
  const session = await auth();
  if (!session?.user?.id || !session.user.address) {
    console.log("ACTION: ❌ Unauthorized - no session");
    return { success: false, error: "Unauthorized" };
  }
  
  console.log("ACTION: 👤 User authenticated:", session.user.id);
  
  const validation = profileSchema.safeParse({
    name: formData.get("name"),
    image: formData.get("image"),
    email: formData.get("email"),
  });
  
  if (!validation.success) {
    console.log("ACTION: ❌ Validation failed:", validation.error.errors[0].message);
    return { success: false, error: validation.error.errors[0].message };
  }
  
  const { name, image, email } = validation.data;
  console.log("ACTION: 📝 Data to update:", { name, image, email });

  try {
    console.log("ACTION: 💾 Updating database...");
    await prisma.user.update({
      where: { walletAddress: session.user.address },
      data: {
        name,
        image,
        email: email || null,
      },
    });

    console.log("ACTION: ✅ Database updated successfully");

    // Revalidate paths
    revalidatePath("/", "layout");
    
    // KIRIM SINYAL PUSHER - INI YANG PENTING!
    console.log("ACTION: 📡 Sending Pusher notification...");
    const channelName = `private-user-${session.user.id}`;
    const eventName = 'session:refresh';
    
    try {
      await pusherServer.trigger(channelName, eventName, { 
        message: "Profile updated, please refresh session.",
        timestamp: new Date().toISOString()
      });
      console.log("ACTION: ✅ Pusher notification sent successfully");
    } catch (pusherError) {
      console.error("ACTION: ⚠️ Pusher error (non-critical):", pusherError);
      // Jangan gagalkan action jika pusher error
    }
    
    console.log("ACTION: 🎉 Profile action completed successfully");
    return { success: true };
    
  } catch (error) {
    console.error("ACTION: ❌ Database error:", error);
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        return { success: false, error: "Email ini sudah digunakan oleh akun lain." };
    }
    return { success: false, error: "Gagal menyimpan profil ke database." };
  }
}