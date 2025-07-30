// app/api/admin/courses/[id]/details/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";
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
    const { user } = await getAuth();
    if (!user?.entityId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateDetailsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    // `update` biasa sudah cukup karena kita punya ID unik dan cek keamanan
    await prisma.credentialTemplate.update({
      where: { id: params.id, creatorId: user.entityId },
      data: validation.data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("server error", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}