import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";
import { z } from "zod";

const pricingSchema = z.object({
  type: z.enum(["FREE", "ONE_TIME"]),
  // Gunakan z.coerce untuk mengubah string dari form menjadi angka
  price: z.coerce.number().min(0, "Harga tidak boleh negatif."),
  currency: z.string().default("ETH"), // Sesuaikan default jika perlu
});

// Handler untuk MENDAPATKAN data harga
export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getAppSession();
    if (!session?.user?.id || !session.user.roles.includes("VERIFIED_ENTITY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pricing = await prisma.pricing.findUnique({
      where: { 
        templateId: params.courseId,
        // Pastikan user hanya bisa melihat harga kursus miliknya
        template: {
            creatorId: session.user.entityId,
        }
     },
    });

    if (!pricing) {
        return NextResponse.json({ error: "Pricing not found or you don't have access." }, { status: 404 });
    }

    return NextResponse.json(pricing);
  } catch (error) {
    console.error(`[API GET Pricing Error] for course ${params.courseId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Handler untuk MEMPERBARUI data harga
export async function PUT(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getAppSession();
    if (!session?.user?.id || !session.user.roles.includes("VERIFIED_ENTITY") || !session.user.entityId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Verifikasi kepemilikan kursus SEBELUM melakukan update
    const course = await prisma.credentialTemplate.findUnique({
        where: { id: params.courseId },
        select: { creatorId: true }
    });

    if (!course || course.creatorId !== session.user.entityId) {
        return NextResponse.json({ error: "Course not found or you do not have permission to edit it." }, { status: 404 });
    }

    // 2. Lanjutkan dengan validasi dan update jika kepemilikan sah
    const body = await req.json();
    const validation = pricingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Data tidak valid", details: validation.error.flatten() }, { status: 400 });
    }
    const { type, price, currency } = validation.data;

    const updatedPricing = await prisma.pricing.upsert({
      where: { templateId: params.courseId },
      update: { type, price, currency },
      create: { templateId: params.courseId, type, price, currency },
    });

    return NextResponse.json(updatedPricing);
  } catch (error) {
    console.error(`[API PUT Pricing Error] for course ${params.courseId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
