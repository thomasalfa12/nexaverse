import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { moduleId: string } }
) {
  try {
    // 1. Otentikasi & Otorisasi menggunakan NextAuth.js
    const session = await getAppSession();
    if (
      !session?.user?.id ||
      !session.user.roles.includes("VERIFIED_ENTITY") ||
      !session.user.entityId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Gunakan `deleteMany` untuk penghapusan yang aman
    // Ini memungkinkan kita untuk menambahkan kondisi berlapis:
    // Hapus modul HANYA JIKA ID-nya cocok DAN modul tersebut
    // adalah bagian dari template yang dibuat oleh pengguna ini.
    const deleteResult = await prisma.courseModule.deleteMany({
      where: {
        id: params.moduleId,
        template: {
          creatorId: session.user.entityId,
        },
      },
    });

    // 3. Periksa apakah ada baris yang berhasil dihapus
    // Jika `count` adalah 0, berarti modul tidak ditemukan atau pengguna tidak punya izin.
    if (deleteResult.count === 0) {
      return NextResponse.json(
        {
          error:
            "Modul tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya.",
        },
        { status: 404 }
      );
    }

    // 4. Kembalikan respons sukses
    // Standar REST API untuk DELETE yang berhasil adalah status 204 (No Content).
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API DELETE Module Error] for module ${params.moduleId}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
