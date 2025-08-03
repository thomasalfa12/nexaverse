import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";
import { z } from "zod";

// FIX: Skema dibuat lebih fleksibel dengan `.partial()`
// Ini memungkinkan frontend mengirim hanya field yang ingin diubah.
const pricingSchema = z.object({
  type: z.enum(["FREE", "ONE_TIME"]).optional(),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif.").optional(),
  currency: z.string().optional(),
  paymentToken: z.string().optional(), // Tambahkan paymentToken
}).partial();

// Handler untuk MENDAPATKAN data harga
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAppSession();
    if (!session?.user?.id || !session.user.roles.includes("VERIFIED_ENTITY") || !session.user.entityId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pricing = await prisma.pricing.findUnique({
      where: {
        courseId: params.id,
        course: {
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAppSession();
    if (!session?.user?.id || !session.user.roles.includes("VERIFIED_ENTITY") || !session.user.entityId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
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
    
    // Data yang divalidasi sekarang bisa berisi field apa pun dari skema
    const dataToUpdate = validation.data;

    const updatedPricing = await prisma.pricing.upsert({
      where: { courseId: params.id },
      // Kirim hanya data yang divalidasi
      update: dataToUpdate,
      // Untuk `create`, kita perlu memastikan semua field wajib ada
      create: { 
        courseId: params.id, 
        type: dataToUpdate.type || 'FREE',
        price: dataToUpdate.price || 0,
        currency: dataToUpdate.currency || 'ETH',
        paymentToken: dataToUpdate.paymentToken,
      },
    });

    return NextResponse.json(updatedPricing);
  } catch (error) {
    console.error(`[API PUT Pricing Error] for course ${params.id}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
