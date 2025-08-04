import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } } // Nama folder adalah [id]
) {
  try {
    const session = await getAppSession();
    if (!session?.user?.id) {
      // Jika tidak login, kembalikan 404 karena user pasti tidak terdaftar
      return NextResponse.json({ error: "Tidak terdaftar" }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: params.id, // FIX: Gunakan params.id agar cocok dengan nama folder
        },
      },
    });

    // KUNCI PERBAIKAN:
    // Hanya kembalikan status 200 OK jika pendaftaran BENAR-BENAR ditemukan.
    if (enrollment) {
      return NextResponse.json(enrollment, { status: 200 });
    } else {
      // Jika tidak ditemukan, kembalikan 404 Not Found.
      return NextResponse.json({ error: "Tidak terdaftar" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
