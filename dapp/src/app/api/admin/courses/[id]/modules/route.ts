import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";
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

// Handler untuk MENDAPATKAN semua modul untuk sebuah kursus
export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getAppSession();
    if (!session?.user?.id || !session.user.roles.includes("VERIFIED_ENTITY") || !session.user.entityId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query yang aman, memastikan user hanya bisa melihat modul dari kursus miliknya
    const modules = await prisma.courseModule.findMany({
      where: { 
        templateId: params.courseId,
        template: { 
            creatorId: session.user.entityId 
        }
      },
      orderBy: { stepNumber: 'asc' },
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error(`[API GET Modules Error] for course ${params.courseId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Handler untuk MEMBUAT modul baru
export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
    try {
        const session = await getAppSession();
        if (!session?.user?.id || !session.user.roles.includes("VERIFIED_ENTITY") || !session.user.entityId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Verifikasi kepemilikan kursus SEBELUM membuat modul
        const course = await prisma.credentialTemplate.findFirst({
            where: { 
                id: params.courseId,
                creatorId: session.user.entityId
            },
            select: { _count: { select: { modules: true } } } // Ambil jumlah modul saat ini
        });

        if (!course) {
            return NextResponse.json({ error: "Course not found or you do not have permission to add modules to it." }, { status: 404 });
        }

        // 2. Lanjutkan dengan validasi dan pembuatan jika kepemilikan sah
        const body = await req.json();
        const validation = moduleSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Data tidak valid", details: validation.error.flatten() }, { status: 400 });
        }
        
        const { title, type, contentText, contentUrl, quizData } = validation.data;
        const moduleCount = course._count.modules;

        const newModule = await prisma.courseModule.create({
            data: {
                title,
                type,
                contentText,
                contentUrl: contentUrl || null,
                quizData: type === 'QUIZ' && quizData 
                    ? (quizData as Prisma.InputJsonValue) 
                    : Prisma.JsonNull,
                templateId: params.courseId,
                stepNumber: moduleCount + 1, // Tentukan urutan modul secara otomatis
            }
        });

        return NextResponse.json(newModule, { status: 201 });
    } catch (error) {
        console.error(`[API POST Module Error] for course ${params.courseId}:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
