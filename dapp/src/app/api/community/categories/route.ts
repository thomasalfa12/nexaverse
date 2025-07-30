// app/api/community/categories/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  try {
    const categories = await prisma.credentialTemplate.findMany({
      where: {
        status: 'PUBLISHED', // Hanya dari kursus yang sudah publish
        category: {
          not: null, // Abaikan yang tidak punya kategori
        },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    // Ubah format dari [{category: 'DeFi'}] menjadi ['DeFi']
    const categoryList = categories.map(c => c.category!);
    
    return NextResponse.json(categoryList);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}