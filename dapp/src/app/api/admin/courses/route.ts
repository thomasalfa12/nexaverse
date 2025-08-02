import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";
import { getServerWalletClient } from "@/lib/server/wallet";
import { contracts } from "@/lib/contracts";
import { parseEther, parseEventLogs, type Log } from "viem";
import { z } from "zod";
import { CourseStatus, PricingType } from "@prisma/client";
// Skema validasi untuk data yang masuk
const createCourseSchema = z.object({
  title: z.string().min(5, "Judul kursus minimal 5 karakter."),
  description: z.string().min(10, "Deskripsi minimal 10 karakter."),
  imageUrl: z.string().url("URL gambar tidak valid."),
  price: z.coerce.number().min(0),
  category: z.string().min(1, "Kategori wajib dipilih."), // Tambahkan kategori
});

// Tipe untuk log event dari kontrak
type DecodedCourseContractCreatedLog = Log & {
  args: { newContractAddress?: `0x${string}` }
}

export async function POST(req: Request) {
  try {
    // 1. Otentikasi & Otorisasi menggunakan NextAuth.js
    const session = await getAppSession();
    if (!session?.user?.address || !session.user.roles.includes("VERIFIED_ENTITY") || !session.user.entityId) {
      return NextResponse.json({ error: "Unauthorized: Anda bukan entitas terverifikasi." }, { status: 401 });
    }

    // 2. Validasi Input
    const body = await req.json();
    const validation = createCourseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Data tidak valid", details: validation.error.flatten() }, { status: 400 });
    }
    
    const { title, description, imageUrl, price, category } = validation.data;
    const symbol = `NEXA-${(title.substring(0, 3) + Math.random().toString(36).substring(2, 6)).toUpperCase()}`;

    // 3. Interaksi On-Chain
    const serverWallet = getServerWalletClient();
    const priceInWei = parseEther(price.toString());
    
    // Gunakan `session.user.address` yang sudah terotentikasi
    const txHash = await serverWallet.writeContract({
      address: contracts.courseFactory.address,
      abi: contracts.courseFactory.abi,
      functionName: 'createCourse',
      args: [title, symbol, priceInWei, session.user.address], 
    });

    const receipt = await serverWallet.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status === 'reverted') {
      throw new Error("Gagal men-deploy kontrak kursus di blockchain.");
    }

    const logs = parseEventLogs({
        abi: contracts.courseFactory.abi,
        logs: receipt.logs,
        eventName: 'CourseContractCreated'
    });
    const newContractAddress = (logs[0] as DecodedCourseContractCreatedLog).args.newContractAddress;
    if (!newContractAddress) {
      throw new Error("Gagal mendapatkan alamat kontrak baru dari event log.");
    }

    // 4. Simpan ke Database
    // OPTIMASI: Tidak perlu query `VerifiedEntity` lagi, `entityId` sudah ada di sesi.
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        imageUrl,
        category,
        contractAddress: newContractAddress.toLowerCase(),
        creatorId: session.user.entityId,
        status: CourseStatus.DRAFT, // Menggunakan enum
        // FIX: Hapus `templateType` karena sudah tidak relevan
        pricing: {
          create: {
            type: price > 0 ? PricingType.ONE_TIME : PricingType.FREE, // Menggunakan enum
            price: price,
            currency: 'ETH',
          }
        },
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui.";
    console.error("[API /admin/courses Error]", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
