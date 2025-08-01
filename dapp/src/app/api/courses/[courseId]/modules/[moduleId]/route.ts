import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/auth";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { contracts } from "@/lib/contracts";

// FIX 1: Pastikan rute ini selalu dinamis untuk menghindari error 'params'
export const dynamic = 'force-dynamic';

const viemClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

export async function GET(
  request: Request,
  { params }: { params: { courseId: string, moduleId: string } }
) {
  try {
    // ... (Verifikasi sesi dan kepemilikan on-chain tidak berubah)
    const { user } = await getAuth();
    if (!user?.address) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const course = await prisma.credentialTemplate.findUnique({
      where: { id: params.courseId },
      select: { contractAddress: true }
    });
    if (!course) {
      return NextResponse.json({ error: "Kursus tidak ditemukan" }, { status: 404 });
    }
    
    const balance = await viemClient.readContract({
      address: course.contractAddress as `0x${string}`,
      abi: contracts.courseManager.abi,
      functionName: 'balanceOf',
      args: [user.address],
    }) as bigint;

    if (balance === 0n) {
      return NextResponse.json({ error: "Anda belum terdaftar di kursus ini" }, { status: 403 });
    }

    // JIKA LOLOS VERIFIKASI: Ambil konten modul
    const moduleContent = await prisma.courseModule.findUnique({
      where: { id: params.moduleId },
      select: {
        title: true,
        type: true,
        contentText: true,
        contentUrl: true,

        quizData: true,
      }
    });

    if (!moduleContent) {
      return NextResponse.json({ error: "Modul tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(moduleContent);

  } catch (error) {
    console.error("Gagal mengambil konten modul:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}