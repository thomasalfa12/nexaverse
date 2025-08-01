import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
// 1. GANTI: Impor helper sesi yang benar
import { getAppSession } from "@/lib/auth";
import { z } from "zod";

const updateDetailsSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  category: z.string().min(1),
  imageUrl: z.string().url().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 2. GANTI: Gunakan getAppSession untuk mendapatkan data sesi
    const session = await getAppSession();

    // 3. GANTI: Pengecekan otentikasi & otorisasi yang benar
    if (!session?.user?.entityId || !session.user.roles.includes("VERIFIED_ENTITY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateDetailsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Data tidak valid", details: validation.error.flatten() }, { status: 400 });
    }

    // 4. GANTI: Gunakan `updateMany` untuk keamanan dan `session.user.entityId`
    const updateResult = await prisma.credentialTemplate.updateMany({
      where: { 
        id: params.id, 
        creatorId: session.user.entityId // Pastikan hanya kreator yang bisa mengedit
      },
      data: validation.data,
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Kursus tidak ditemukan atau Anda tidak memiliki izin." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("server error", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
