// api/admin/courses/[id]/modules/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const quizQuestionSchema = z.object({
  questionText: z.string().min(5),
  options: z.array(z.string().min(1)).length(4),
  correctAnswerIndex: z.number().min(0).max(3),
});

const moduleSchema = z.object({
  title: z.string().min(3),
  type: z.enum(["CONTENT", "LIVE_SESSION", "SUBMISSION", "QUIZ"]),
  textContent: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  sessionTime: z.string().datetime().optional(),
  assignmentInstructions: z.string().optional(),
  quizData: z.object({
    questions: z.array(quizQuestionSchema).min(1),
  }).optional(),
}).superRefine((data, ctx) => {
  switch (data.type) {
    case "CONTENT":
      if (!data.textContent || data.textContent.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Konten teks minimal 10 karakter.",
          path: ["textContent"],
        });
      }
      break;
    case "LIVE_SESSION":
      if (!data.meetingUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL Sesi Live wajib diisi.",
          path: ["meetingUrl"],
        });
      }
      if (!data.sessionTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Waktu sesi wajib diisi.",
          path: ["sessionTime"],
        });
      }
      break;
    case "SUBMISSION":
      if (!data.assignmentInstructions || data.assignmentInstructions.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Instruksi tugas minimal 10 karakter.",
          path: ["assignmentInstructions"],
        });
      }
      break;
    case "QUIZ":
      if (!data.quizData || !data.quizData.questions || data.quizData.questions.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Kuis harus memiliki setidaknya satu pertanyaan.",
          path: ["quizData", "questions"],
        });
      }
      break;
  }
});

// ===== TAMBAHKAN HANDLER GET INI =====
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const courseId = params.id;

  try {
    const session = await getAppSession();
    if (!session?.user?.id || !session.user.roles?.includes("VERIFIED_ENTITY") || !session.user.entityId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ambil semua modules untuk course ini
    const modules = await prisma.courseModule.findMany({
      where: { 
        courseId: courseId,
        course: { 
          creatorId: session.user.entityId 
        }
      },
      orderBy: { stepNumber: 'asc' },
      include: {
        textContent: true,
        videoContent: true,
        liveSession: true,
        assignment: true,
        quiz: true,
      }
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error(`[API GET Modules Error] for course ${courseId}:`, error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// ===== HANDLER POST YANG SUDAH ADA =====
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const courseId = params.id;

  try {
    const session = await getAppSession();
    if (!session?.user?.id || !session.user.roles?.includes("VERIFIED_ENTITY") || !session.user.entityId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.course.findFirst({
      where: { 
        id: courseId,
        creatorId: session.user.entityId
      },
      select: { _count: { select: { modules: true } } }
    });

    if (!course) {
      return NextResponse.json({ error: "Kursus tidak ditemukan atau Anda tidak punya izin." }, { status: 404 });
    }

    const body = await req.json();
    console.log("Raw request body:", JSON.stringify(body, null, 2));

    const validation = moduleSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation errors:", validation.error.flatten());
      return NextResponse.json({ 
        error: "Data tidak valid", 
        details: validation.error.flatten(),
        receivedData: body 
      }, { status: 400 });
    }
    
    const { title, type } = validation.data;
    const moduleCount = course._count.modules;

    const newModule = await prisma.$transaction(async (tx) => {
      const createdModule = await tx.courseModule.create({
        data: {
          title,
          type,
          courseId: courseId,
          stepNumber: moduleCount + 1,
        }
      });

      switch (validation.data.type) {
        case 'CONTENT':
          if (validation.data.textContent) {
            await tx.moduleText.create({ 
              data: { 
                moduleId: createdModule.id, 
                content: validation.data.textContent 
              } 
            });
          }
          break;
        case 'LIVE_SESSION':
          if (validation.data.meetingUrl && validation.data.sessionTime) {
            await tx.moduleLiveSession.create({ 
              data: { 
                moduleId: createdModule.id, 
                meetingUrl: validation.data.meetingUrl, 
                sessionTime: new Date(validation.data.sessionTime)
              } 
            });
          }
          break;
        case 'SUBMISSION':
          if (validation.data.assignmentInstructions) {
            await tx.moduleAssignment.create({ 
              data: { 
                moduleId: createdModule.id, 
                instructions: validation.data.assignmentInstructions 
              } 
            });
          }
          break;
        case 'QUIZ':
          if (validation.data.quizData) {
            await tx.moduleQuiz.create({ 
              data: { 
                moduleId: createdModule.id, 
                questions: validation.data.quizData as Prisma.InputJsonValue 
              } 
            });
          }
          break;
      }
      return createdModule;
    });

    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    console.error(`[API POST Module Error] for course ${courseId}:`, error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}