import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";
import { z } from "zod";
import { CourseStatus, Prisma } from "@prisma/client";

// --- Skema Validasi Backend yang Mencerminkan Frontend ---

const quizQuestionSchema = z.object({
  questionText: z.string().min(5),
  options: z.array(z.string().min(1)).length(4),
  correctAnswerIndex: z.coerce.number().min(0).max(3),
});

const moduleBaseSchema = z.object({
  title: z.string().min(3, "Judul modul minimal 3 karakter."),
  type: z.enum(["CONTENT", "LIVE_SESSION", "SUBMISSION", "QUIZ"]),
  textContent: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  sessionTime: z.coerce.date().optional(),
  assignmentInstructions: z.string().optional(),
  quizData: z.object({ questions: z.array(quizQuestionSchema).min(1) }).optional(),
});

const createCourseSchema = z.object({
  title: z.string().min(5, "Judul kursus minimal 5 karakter."),
  description: z.string().min(10, "Deskripsi minimal 10 karakter."),
  imageUrl: z.string().url("URL gambar tidak valid."),
  category: z.string().min(1, "Kategori wajib dipilih."),
  price: z.coerce.number().min(0),
  modules: z.array(moduleBaseSchema).min(1, "Kursus harus memiliki setidaknya 1 modul."),
});

export async function POST(req: Request) {
  try {
    // 1. Otentikasi & Otorisasi menggunakan NextAuth.js
    const session = await getAppSession();
    if (!session?.user?.id || !session.user.roles.includes("VERIFIED_ENTITY") || !session.user.entityId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validasi Input
    const body = await req.json();
    const validation = createCourseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Data tidak valid", details: validation.error.flatten() }, { status: 400 });
    }
    
    const { title, description, imageUrl, category, price, modules } = validation.data;
    
    // 3. Simpan ke Database menggunakan Transaksi
    const newCourse = await prisma.$transaction(async (tx) => {
      const createdCourse = await tx.course.create({
        data: { 
          title, 
          description, 
          imageUrl,
          category,
          // Alamat kontrak akan diisi nanti saat proses deploy on-chain
          contractAddress: `placeholder-${Date.now()}`, 
          creatorId: session.user.entityId!,
          status: CourseStatus.DRAFT,
          pricing: {
            create: {
              type: price > 0 ? 'ONE_TIME' : 'FREE',
              price: price,
              currency: 'ETH', // Asumsi mata uang
            }
          },
        },
      });

      // Buat semua modul dan konten spesifiknya
      for (const [index, moduleData] of modules.entries()) {
        const createdModule = await tx.courseModule.create({
          data: {
            courseId: createdCourse.id,
            stepNumber: index + 1,
            title: moduleData.title,
            type: moduleData.type,
          }
        });

        // Buat entri di tabel konten yang sesuai
        switch (moduleData.type) {
          case 'CONTENT':
            if (moduleData.textContent) await tx.moduleText.create({ data: { moduleId: createdModule.id, content: moduleData.textContent } });
            break;
          case 'LIVE_SESSION':
            if (moduleData.meetingUrl && moduleData.sessionTime) await tx.moduleLiveSession.create({ data: { moduleId: createdModule.id, meetingUrl: moduleData.meetingUrl, sessionTime: moduleData.sessionTime } });
            break;
          case 'SUBMISSION':
            if (moduleData.assignmentInstructions) await tx.moduleAssignment.create({ data: { moduleId: createdModule.id, instructions: moduleData.assignmentInstructions } });
            break;
          case 'QUIZ':
            if (moduleData.quizData) await tx.moduleQuiz.create({ data: { moduleId: createdModule.id, questions: moduleData.quizData as Prisma.InputJsonValue } });
            break;
        }
      }

      // Kembalikan data kursus yang baru dibuat beserta modulnya
      return tx.course.findUnique({
        where: { id: createdCourse.id },
        include: { modules: true },
      });
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat kursus:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
