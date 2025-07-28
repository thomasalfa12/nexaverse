import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";
import { getServerWalletClient } from "@/lib/server/wallet";
import { contracts } from "@/lib/contracts";
import { parseEther, parseEventLogs, type Log } from "viem";
import { z } from "zod";



const createCourseSchema = z.object({
  title: z.string().min(5, "Judul kursus minimal 5 karakter."),
  description: z.string().min(10, "Deskripsi minimal 10 karakter."),
  imageUrl: z.string().url("URL gambar tidak valid."), // URL IPFS dari frontend
  price: z.coerce.number().min(0),
});

type DecodedCourseContractCreatedLog = Log & {
  args: { newContractAddress?: `0x${string}` }
}

export async function POST(req: Request) {
  try {
    const { user } = await getAuth();
    if (!user?.address || !user.roles.includes("VERIFIED_ENTITY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = createCourseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Data tidak valid", details: validation.error.flatten() }, { status: 400 });
    }
    
    const { title, description, imageUrl, price } = validation.data;
    const symbol = `NEXA-${(title.substring(0, 3) + Math.random().toString(36).substring(2, 6)).toUpperCase()}`;

    // Interaksi On-Chain
    const serverWallet = getServerWalletClient();
    const priceInWei = parseEther(price.toString());
    const txHash = await serverWallet.writeContract({
      address: contracts.courseFactory.address,
      abi: contracts.courseFactory.abi,
      functionName: 'createCourse',
      args: [title, symbol, priceInWei, user.address], // Sesuaikan dengan args di kontrak Anda
    });
    const receipt = await serverWallet.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status === 'reverted') throw new Error("Gagal men-deploy kontrak kursus.");

    const logs = parseEventLogs({
        abi: contracts.courseFactory.abi,
        logs: receipt.logs,
        eventName: 'CourseContractCreated'
    });
    const newContractAddress = (logs[0] as DecodedCourseContractCreatedLog).args.newContractAddress;
    if (!newContractAddress) throw new Error("Gagal mendapatkan alamat kontrak baru.");

    // Simpan ke Database dalam satu transaksi
    const entity = await prisma.verifiedEntity.findUnique({ where: { walletAddress: user.address } });
    if (!entity) throw new Error("Entitas tidak ditemukan.");

    const newCourse = await prisma.credentialTemplate.create({
      data: {
        title,
        description,
        imageUrl,
        contractAddress: newContractAddress.toLowerCase(),
        creatorId: entity.id,
        status: 'DRAFT',
        pricing: {
          create: {
            type: price > 0 ? 'ONE_TIME' : 'FREE',
            price: price,
            currency: 'ETH',
          }
        },
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan.";
    console.error("[API /admin/courses Error]", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}