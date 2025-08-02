import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
// 1. GANTI: Impor helper sesi yang benar
import { getAppSession } from "@/lib/auth";
import { z } from "zod";

// Skema untuk memvalidasi status yang masuk
const updateStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export async function PUT(
  request: Request,
  { params }: { params: { courseId: string } } // Asumsi nama folder adalah [courseId]
) {
  try {
    // 2. GANTI: Gunakan getAppSession untuk otentikasi & otorisasi
    const session = await getAppSession();
    if (!session?.user?.id || !session.user.roles.includes("VERIFIED_ENTITY") || !session.user.entityId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // 3. Validasi input body
    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Status yang diberikan tidak valid." }, { status: 400 });
    }

    // 4. GANTI: Query update yang lebih aman dan efisien
    // Ini memastikan pengguna hanya bisa mengubah status kursus miliknya sendiri.
        const updateResult = await prisma.course.updateMany({
      where: {
        id: params.courseId,
        creatorId: session.user.entityId,
      },
      data: {
        status: validation.data.status
      },
    });


    // Periksa apakah ada baris yang berhasil diupdate
    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Kursus tidak ditemukan atau Anda tidak memiliki izin untuk mengubahnya." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Status kursus berhasil diubah menjadi ${validation.data.status}` });
  } catch (error) {
    console.error(`[API ERROR] Gagal mengubah status untuk kursus ${params.courseId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
