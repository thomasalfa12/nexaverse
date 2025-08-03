import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth";
import { prisma } from "@/lib/server/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Ubah ke Promise
) {
  try {
    const session = await getAppSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params; // Await params dulu

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
    });

    return NextResponse.json({ enrollment });
  } catch (error) {
    console.error("[API ERROR] Gagal mengambil enrollment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}