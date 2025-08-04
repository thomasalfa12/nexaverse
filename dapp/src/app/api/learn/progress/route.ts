// File: app/api/learn/progress/route.ts (LENGKAP & FINAL)

import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth";
import { prisma } from "@/lib/server/prisma";

export async function POST(req: Request) {
  try {
    // 1. Dapatkan sesi pengguna untuk otentikasi
    const session = await getAppSession();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Ambil data yang dikirim dari client (dari hook useLearningState)
    const body = await req.json();
    const { courseId, completedModulesCount } = body;

    if (!courseId || completedModulesCount === undefined) {
      return new NextResponse("Bad Request: courseId and completedModulesCount are required", { status: 400 });
    }

    // 3. Update data progress di tabel Enrollment
    //    Gunakan `update` karena record enrollment pasti sudah ada
    await prisma.enrollment.update({
      where: {
        // Kunci unik untuk menemukan record yang tepat
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
      data: {
        // Perbarui field 'progress' dengan jumlah modul yang sudah selesai
        progress: completedModulesCount,
      },
    });

    // 4. Kirim respons sukses
    return NextResponse.json({ success: true, message: "Progress updated successfully." });

  } catch (error) {
    console.error("[API_LEARN_PROGRESS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}