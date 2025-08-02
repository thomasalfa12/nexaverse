import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
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
  // FIX: Ekstrak ID di awal untuk menghindari error dynamic route
  const courseId = params.id;

  try {
    const session = await getAppSession();
    if (!session?.user?.entityId || !session.user.roles.includes("VERIFIED_ENTITY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateDetailsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Data tidak valid", details: validation.error.flatten() }, { status: 400 });
    }

    const updateResult = await prisma.course.updateMany({
      where: { 
        id: courseId, 
        creatorId: session.user.entityId // Pastikan hanya kreator yang bisa mengedit
      },
      data: validation.data,
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Kursus tidak ditemukan atau Anda tidak memiliki izin." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Server error on details update:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
