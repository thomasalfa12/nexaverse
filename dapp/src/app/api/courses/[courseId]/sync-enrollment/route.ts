import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";
import { EnrollmentStatus } from "@prisma/client";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { nexaCourseAbi } from "@/lib/contracts"; // ✅ Import ABI langsung

// Inisialisasi Viem client untuk interaksi on-chain
const viemClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } } // ✅ FIX: Hapus Promise wrapper
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

    console.log(`[DEBUG] Syncing enrollment for user ${userId} in course ${courseId}`);

    // 2. Ambil Alamat Kontrak: Dapatkan alamat smart contract dari kursus yang akan disinkronkan.
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { contractAddress: true, title: true }
    });

    if (!course || !course.contractAddress) {
      return NextResponse.json({ 
        error: "Kursus atau alamat kontrak tidak ditemukan." 
      }, { status: 404 });
    }

    console.log(`[DEBUG] Course found: ${course.title}, Contract: ${course.contractAddress}`);

    // 3. KUNCI KEAMANAN: Lakukan Verifikasi On-Chain
    let isEnrolledOnChain = false;
    try {
      isEnrolledOnChain = await viemClient.readContract({
        address: course.contractAddress as `0x${string}`,
        abi: nexaCourseAbi, // ✅ FIX: Gunakan ABI yang benar
        functionName: 'isEnrolled',
        args: [userAddress],
      }) as boolean;

      console.log(`[DEBUG] On-chain enrollment status: ${isEnrolledOnChain}`);
    } catch (onchainError) {
      console.error(`[API Sync On-Chain Check Error] for course ${courseId}:`, onchainError);
      return NextResponse.json({ 
        error: "Gagal memverifikasi status pendaftaran di blockchain.",
        details: onchainError instanceof Error ? onchainError.message : "Unknown blockchain error"
      }, { status: 500 });
    }

    // Jika verifikasi on-chain gagal, tolak permintaan.
    if (!isEnrolledOnChain) {
      console.log(`[DEBUG] User ${userAddress} not enrolled on-chain for course ${courseId}`);
      return NextResponse.json({ 
        error: "Verifikasi on-chain gagal: Anda belum terdaftar di kursus ini." 
      }, { status: 403 });
    }

    // 4. JIKA LOLOS VERIFIKASI: Lanjutkan dengan logika `upsert` yang aman.
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
      update: {
        // ✅ FIX: Hanya update field yang ada di schema
        status: EnrollmentStatus.IN_PROGRESS,
      },
      create: {
        userId: userId,
        courseId: courseId,
        status: EnrollmentStatus.IN_PROGRESS,
      },
      select: {
        id: true,
        status: true,
        progress: true,
        enrolledAt: true, // ✅ FIX: Gunakan field yang benar-benar ada
      }
    });

    console.log(`[DEBUG] Enrollment upserted successfully:`, enrollment);

    return NextResponse.json({ 
      success: true, 
      message: "Data pendaftaran berhasil diverifikasi dan disinkronkan.",
      enrollment
    });

  } catch (error) {
    console.error(`[API Sync Enrollment Error] for course ${params.courseId}:`, error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}