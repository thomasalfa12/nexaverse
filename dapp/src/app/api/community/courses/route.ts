import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";

interface DecodedToken { address: string; roles: string[]; }

const moduleSchema = z.object({
  title: z.string().min(3, "Judul modul minimal 3 karakter."),
  type: z.enum(["CONTENT", "LIVE_SESSION", "SUBMISSION"]),
  contentText: z.string().optional(),
  contentUrl: z.string().url("URL tidak valid.").or(z.literal("")).optional(),
});

// FIX: Menambahkan `category` dan `promoVideoUrl` ke skema backend
const createCourseSchema = z.object({
  title: z.string().min(5, "Judul kursus minimal 5 karakter."),
  description: z.string().min(10, "Deskripsi minimal 10 karakter."),
  imageUrl: z.string().url("URL gambar tidak valid."),
  category: z.string().optional(),
  promoVideoUrl: z.string().url("URL video tidak valid.").or(z.literal("")).optional(),
  modules: z.array(moduleSchema).min(1, "Kursus harus memiliki setidaknya 1 modul."),
});

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("nexa_session")?.value;
    if (!token) return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    if (!decoded.roles.includes("VERIFIED_ENTITY")) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const creator = await prisma.verifiedEntity.findUnique({ where: { walletAddress: decoded.address } });
    if (!creator) return NextResponse.json({ error: "Entitas kreator tidak ditemukan" }, { status: 404 });

    const body = await req.json();
    const validation = createCourseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Data tidak valid", details: validation.error.flatten() }, { status: 400 });
    }
    
    // FIX: Mengambil data baru dari body yang divalidasi
    const { title, description, imageUrl, category, promoVideoUrl, modules } = validation.data;
    const placeholderContractAddress = `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const newCourse = await prisma.$transaction(async (tx) => {
      const createdTemplate = await tx.credentialTemplate.create({
        data: { 
          title, 
          description, 
          imageUrl,
          category,         // Simpan data baru
          promoVideoUrl,    // Simpan data baru
          contractAddress: placeholderContractAddress, 
          creatorId: creator.id 
        },
      });

      await Promise.all(
        modules.map((module, index) => tx.courseModule.create({
          data: {
            templateId: createdTemplate.id,
            stepNumber: index + 1,
            title: module.title,
            type: module.type,
            contentText: module.contentText,
            contentUrl: module.contentUrl || null,
          },
        }))
      );

      return tx.credentialTemplate.findUnique({
        where: { id: createdTemplate.id },
        include: { modules: true },
      });
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat kursus:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
