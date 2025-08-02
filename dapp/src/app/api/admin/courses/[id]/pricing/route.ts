import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";
import { z } from "zod";

const pricingSchema = z.object({
  type: z.enum(["FREE", "ONE_TIME"]),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif."),
  currency: z.string().default("ETH"),
});

// Handler untuk MENDAPATKAN data harga
export async function GET(
  req: Request,
  { params }: { params: { id: string } } // FIX: Gunakan 'id' sesuai nama folder [id]
) {
  try {
    const session = await getAppSession();
    // FIX: Tambahkan pengecekan !session.user.entityId untuk otorisasi yang lebih kuat
    // Ini juga akan menyelesaikan error TypeScript.
    if (!session?.user?.id || !session.user.roles.includes("VERIFIED_ENTITY") || !session.user.entityId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pricing = await prisma.pricing.findUnique({
      where: {
        courseId: params.id, // FIX: Gunakan params.id
        course: {
          // Sekarang TypeScript tahu `entityId` adalah number, bukan null.
          creatorId: session.user.entityId,
        }
      },
    });

    if (!pricing) {
        return NextResponse.json({ error: "Data harga tidak ditemukan atau Anda tidak memiliki akses." }, { status: 404 });
    }

    return NextResponse.json(pricing);
  } catch (error) {
    console.error(`[API GET Pricing Error] for course ${params.id}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Handler untuk MEMPERBARUI data harga
export async function PUT(
  req: Request,
  { params }: { params: { id: string } } // FIX: Gunakan 'id' sesuai nama folder [id]
) {
  try {
    const session = await getAppSession();
    if (!session?.user?.id || !session.user.roles.includes("VERIFIED_ENTITY") || !session.user.entityId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id }, // FIX: Gunakan params.id
      select: { creatorId: true }
    });

    if (!course || course.creatorId !== session.user.entityId) {
        return NextResponse.json({ error: "Kursus tidak ditemukan atau Anda tidak memiliki izin untuk mengeditnya." }, { status: 404 });
    }

    const body = await req.json();
    const validation = pricingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Data tidak valid", details: validation.error.flatten() }, { status: 400 });
    }
    const { type, price, currency } = validation.data;

    const updatedPricing = await prisma.pricing.upsert({
      where: { courseId: params.id }, // FIX: Gunakan params.id
      update: { type, price, currency },
      create: { courseId: params.id, type, price, currency },
    });

    return NextResponse.json(updatedPricing);
  } catch (error) {
    console.error(`[API PUT Pricing Error] for course ${params.id}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
