"use server";

import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
// REFACTOR: Import tipe error spesifik dari Prisma
import { Prisma } from "@prisma/client";

const profileSchema = z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter." }).trim(),
  image: z.string().url("URL gambar tidak valid.").nullable().optional(),
  email: z.string().email("Format email tidak valid.").nullable().optional().or(z.literal("")),
});

interface ProfileResult {
  success: boolean;
  error?: string;
  data?: {
    name: string;
    image: string | null;
    email: string | null;
  };
}

export async function createOrUpdateProfileAction(formData: FormData): Promise<ProfileResult> {
  const session = await auth();
  if (!session?.user?.id || !session.user.address) {
    return { success: false, error: "Unauthorized" };
  }
  
  const validation = profileSchema.safeParse({
    name: formData.get("name"),
    image: formData.get("image"),
    email: formData.get("email"),
  });
  
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }
  
  const { name, image, email } = validation.data;

  try {
    const updatedUser = await prisma.user.update({
      where: { walletAddress: session.user.address },
      data: {
        name,
        image,
        email: email || null,
      },
    });

    revalidatePath("/", "layout");
    
    return { 
      success: true,
      data: {
        name: updatedUser.name!,
        image: updatedUser.image,
        email: updatedUser.email,
      }
    };
    
  } catch (error) {
    console.error("ACTION: ❌ Database error:", error);

    // REFACTOR: Ganti pengecekan 'any' dengan pengecekan instance error Prisma yang type-safe
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 adalah kode untuk pelanggaran unique constraint (misal: email sudah ada)
      if (error.code === 'P2002') {
          return { success: false, error: "Email ini sudah digunakan oleh akun lain." };
      }
    }
    
    // Fallback untuk error lainnya
    return { success: false, error: "Gagal menyimpan profil ke database." };
  }
}