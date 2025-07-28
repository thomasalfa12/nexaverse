import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";
import { z } from "zod";

const updateDetailsSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter."),
  description: z.string().min(10, "Deskripsi minimal 10 karakter."),
  category: z.string().optional(),
  promoVideoUrl: z.string().url("URL video tidak valid").or(z.literal("")).optional(),
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
    const validation = updateDetailsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Data tidak valid", details: validation.error.flatten() }, { status: 400 });
    }

    const updatedCourse = await prisma.credentialTemplate.update({
      where: { id: params.id, creator: { walletAddress: user.address } },
      data: {
        title: validation.data.title,
        description: validation.data.description,
        category: validation.data.category,
        promoVideoUrl: validation.data.promoVideoUrl,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}