import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Skema validasi untuk data kuis (jika ada)
const quizQuestionSchema = z.object({
  questionText: z.string().min(1, "Teks pertanyaan tidak boleh kosong."),
  options: z.array(z.string().min(1, "Teks pilihan tidak boleh kosong.")).length(4, "Harus ada 4 pilihan jawaban."),
  correctAnswerIndex: z.coerce.number().min(0).max(3),
});

// Skema validasi utama untuk modul baru
const moduleSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter."),
  type: z.enum(["CONTENT", "LIVE_SESSION", "SUBMISSION", "QUIZ"]),
  contentText: z.string().optional(),
  contentUrl: z.string().url("URL tidak valid.").or(z.literal("")).optional(),
  quizData: z.object({
      questions: z.array(quizQuestionSchema)
  }).optional(),
});

// Mengambil semua modul untuk sebuah kursus
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await getAuth();
    if (!user?.address || !user.roles.includes("VERIFIED_ENTITY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const modules = await prisma.courseModule.findMany({
      where: { 
        templateId: params.id,
        template: { creator: { walletAddress: user.address } } // Keamanan
      },
      orderBy: { stepNumber: 'asc' },
    });
    return NextResponse.json(modules);
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Membuat modul baru (sekarang bisa menangani kuis)
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { user } = await getAuth();
        if (!user?.address || !user.roles.includes("VERIFIED_ENTITY")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = moduleSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Data tidak valid", details: validation.error.flatten() }, { status: 400 });
        }
        
        const moduleCount = await prisma.courseModule.count({ where: { templateId: params.id } });

        const newModule = await prisma.courseModule.create({
            data: {
                title: validation.data.title,
                type: validation.data.type,
                contentText: validation.data.contentText,
                contentUrl: validation.data.contentUrl || null,
                // FIX: Menghilangkan `any` dengan melakukan casting ke tipe `Prisma.InputJsonValue`
                // yang merupakan cara aman untuk menangani input JSON di Prisma.
                quizData: validation.data.type === 'QUIZ' 
                    ? (validation.data.quizData as Prisma.InputJsonValue) 
                    : Prisma.JsonNull,
                templateId: params.id,
                stepNumber: moduleCount + 1,
            }
        });

        return NextResponse.json(newModule, { status: 201 });
    } catch (error) {
        console.error("Error creating module:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}