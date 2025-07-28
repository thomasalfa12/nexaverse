import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";
import { z } from "zod";

const pricingSchema = z.object({
  type: z.enum(["FREE", "ONE_TIME"]),
  price: z.number().min(0, "Harga tidak boleh negatif."),
  currency: z.string().default("USDC"),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await getAuth();
    if (!user?.address || !user.roles.includes("VERIFIED_ENTITY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const pricing = await prisma.pricing.findUnique({
      // FIX: `where` clause untuk field @unique sudah benar.
      where: { templateId: params.id },
    });
    return NextResponse.json(pricing);
  } catch { // FIX: Menghapus variabel 'error' yang tidak digunakan
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await getAuth();
    if (!user?.address || !user.roles.includes("VERIFIED_ENTITY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = pricingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Data tidak valid", details: validation.error.flatten() }, { status: 400 });
    }
    const { type, price, currency } = validation.data;

    const updatedPricing = await prisma.pricing.upsert({
      // FIX: `where` clause untuk field @unique sudah benar.
      where: { templateId: params.id },
      update: { type, price, currency },
      create: { templateId: params.id, type, price, currency },
    });

    return NextResponse.json(updatedPricing);
  } catch { // FIX: Menghapus variabel 'error' yang tidak digunakan
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

