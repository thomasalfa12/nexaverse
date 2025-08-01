import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
// 1. GANTI: Impor helper sesi yang benar
import { getAppSession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    // 1. Otentikasi: Pastikan pengguna sudah login menggunakan NextAuth.js.
    const session = await getAppSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. HAPUS: Logika upsert profil tidak lagi diperlukan.
    // Jika sesi valid, kita sudah dijamin memiliki data User di database.
    const userId = session.user.id;
    const courseId = params.courseId;

    // 3. Cek Pendaftaran yang Sudah Ada: Cegah pendaftaran ganda.
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { 
        // Menggunakan indeks unik gabungan yang baru dari skema Anda
        userId_templateId: { 
          userId: userId, 
          templateId: courseId 
        } 
      }
    });

    if (existingEnrollment) {
      return NextResponse.json({ message: "Anda sudah terdaftar di kursus ini." }, { status: 200 });
    }

    // 4. Logika Pembayaran (Placeholder): Di aplikasi nyata, di sinilah
    //    Anda akan memverifikasi pembayaran sebelum melanjutkan.
    //    Untuk saat ini, kita asumsikan kursus gratis.

    // 5. Buat Pendaftaran Baru: Simpan data pendaftaran ke database.
    const newEnrollment = await prisma.enrollment.create({
      data: {
        userId: userId,
        templateId: courseId,
        status: 'IN_PROGRESS', // Set status awal
      }
    });

    // 6. Kembalikan Respon Sukses
    return NextResponse.json(newEnrollment, { status: 201 }); // Gunakan status 201 Created

  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
