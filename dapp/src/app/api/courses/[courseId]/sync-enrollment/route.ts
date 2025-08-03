import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";
import { EnrollmentStatus } from "@prisma/client";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { contracts } from "@/lib/contracts";

// Inisialisasi Viem client untuk interaksi on-chain
const viemClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    // 1. Otentikasi: Pastikan pengguna yang meminta sinkronisasi sudah login.
    const session = await getAppSession();
    if (!session?.user?.id || !session.user.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userAddress = session.user.address as `0x${string}`;
    const courseId = params.courseId;

    // 2. Ambil Alamat Kontrak: Dapatkan alamat smart contract dari kursus yang akan disinkronkan.
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { contractAddress: true }
    });
    if (!course || !course.contractAddress) {
        return NextResponse.json({ error: "Kursus atau alamat kontrak tidak ditemukan." }, { status: 404 });
    }

    // 3. KUNCI KEAMANAN: Lakukan Verifikasi On-Chain
    // Sebelum menulis ke database, kita bertanya ke blockchain: "Apakah pengguna ini BENAR-BENAR sudah terdaftar?"
    let isEnrolledOnChain = false;
    try {
        isEnrolledOnChain = await viemClient.readContract({
            address: course.contractAddress as `0x${string}`,
            abi: contracts.nexaCourse.abi, // Gunakan ABI yang sesuai
            functionName: 'isEnrolled',
            args: [userAddress],
        }) as boolean;
    } catch (onchainError) {
        console.error(`[API Sync On-Chain Check Error] for course ${courseId}:`, onchainError);
        return NextResponse.json({ error: "Gagal memverifikasi status pendaftaran di blockchain." }, { status: 500 });
    }
    
    // Jika verifikasi on-chain gagal, tolak permintaan.
    if (!isEnrolledOnChain) {
        return NextResponse.json({ error: "Verifikasi on-chain gagal: Anda belum terdaftar di kursus ini." }, { status: 403 });
    }

    // 4. JIKA LOLOS VERIFIKASI: Lanjutkan dengan logika `upsert` yang aman.
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
      update: {}, 
      create: {
        userId: userId,
        courseId: courseId,
        status: EnrollmentStatus.IN_PROGRESS,
      },
    });

    return NextResponse.json({ success: true, message: "Data pendaftaran berhasil diverifikasi dan disinkronkan." });

  } catch (error) {
    console.error(`[API Sync Enrollment Error] for course ${params.courseId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
