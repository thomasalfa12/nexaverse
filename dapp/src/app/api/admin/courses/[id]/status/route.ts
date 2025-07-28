import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await getAuth();
    if (!user?.address || !user.roles.includes("VERIFIED_ENTITY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const updatedCourse = await prisma.credentialTemplate.update({
      where: { 
        id: params.id, 
        creator: { 
          walletAddress: user.address 
        } 
      },
      data: { 
        status: validation.data.status 
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error(`[API ERROR] Gagal mengubah status untuk kursus ${params.id}:`, error);
    
    // FIX: Menghapus `any` dengan pengecekan properti yang aman secara tipe.
    // Ini memeriksa apakah 'error' adalah objek yang memiliki properti 'code'
    // sebelum mengaksesnya.
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        return NextResponse.json({ error: "Kursus tidak ditemukan atau Anda tidak memiliki izin untuk mengubahnya." }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}