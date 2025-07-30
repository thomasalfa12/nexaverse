import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Otentikasi: Pastikan pengguna sudah login.
    const { user } = await getAuth();
    if (!user?.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Cari atau Buat Profil Pengguna (Upsert Logic)
    // FIX: Menggunakan `upsert` untuk membuat profil jika belum ada.
    // Ini menyelesaikan masalah error 404 "Profil tidak ditemukan".
    const profile = await prisma.profile.upsert({
      where: { walletAddress: user.address },
      update: {}, // Tidak ada yang perlu diupdate jika profil sudah ada
      create: {
        walletAddress: user.address,
        // Anda bisa menambahkan nama default di sini jika diinginkan
        // name: "New Nexaverse User"
      }
    });

    const courseId = params.id;

    // 3. Cek Pendaftaran yang Sudah Ada: Cegah pendaftaran ganda.
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { 
        profileId_templateId: { 
          profileId: profile.id, 
          templateId: courseId 
        } 
      }
    });
    if (existingEnrollment) {
      // Mengembalikan status 200 OK dengan pesan karena ini bukan error,
      // pengguna hanya mencoba mendaftar lagi.
      return NextResponse.json({ message: "Anda sudah terdaftar di kursus ini." }, { status: 200 });
    }

    // 4. Logika Pembayaran (Placeholder): Di aplikasi nyata, di sinilah
    //    Anda akan memverifikasi pembayaran crypto sebelum melanjutkan.
    //    Untuk saat ini, kita asumsikan kursus gratis.

    // 5. Buat Pendaftaran Baru: Simpan data pendaftaran ke database.
    const newEnrollment = await prisma.enrollment.create({
      data: {
        profileId: profile.id,
        templateId: courseId,
      }
    });

    // 6. Kembalikan Respon Sukses
    return NextResponse.json(newEnrollment, { status: 201 }); // Gunakan status 201 Created

  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}