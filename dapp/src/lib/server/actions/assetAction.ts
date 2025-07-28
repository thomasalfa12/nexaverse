"use server";

import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";
import { revalidatePath } from "next/cache";
import { getServerWalletClient } from "@/lib/server/wallet";
import { contracts } from "@/lib/contracts";
// FIX: Mengimpor fungsi yang benar dari uploader Anda
import { uploadToPinataServer } from "@/lib/pinata-uploader";
import { parseEther, parseEventLogs, type Log } from "viem";
import type { TemplateType } from "@prisma/client";

interface ActionResult {
  success: boolean;
  error?: string;
}

type DecodedLog = Log & {
  args: {
    newContractAddress?: `0x${string}`;
    courseContract?: `0x${string}`;
  }
}

export async function createAssetAction(formData: FormData): Promise<ActionResult> {
  try {
    const { user } = await getAuth();
    if (!user?.address) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const templateType = formData.get("templateType") as TemplateType;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File;

    if (!title || !description || !imageFile || imageFile.size === 0) {
      return { success: false, error: "Judul, deskripsi, dan gambar wajib diisi." };
    }

    // --- ALUR IPFS YANG DIPERBAIKI ---

    // 1. Unggah gambar sampul terlebih dahulu menggunakan fungsi server
    const imageUrl = await uploadToPinataServer(imageFile, { metadata: { name: `Cover-${title}` } });

    // 2. Buat objek metadata JSON
    const metadata = {
        name: title,
        description: description,
        image: imageUrl,
    };

    // 3. Konversi objek JSON menjadi objek File
    const metadataString = JSON.stringify(metadata);
    const metadataBlob = new Blob([metadataString], { type: 'application/json' });
    const metadataFile = new File([metadataBlob], 'metadata.json');

    // 4. Unggah file JSON metadata ke IPFS menggunakan fungsi yang sama
    const baseURI = await uploadToPinataServer(metadataFile, { metadata: { name: `Metadata-${title}` } });

    // --- Sisa alur (On-Chain & Database) ---
    
    let newContractAddress: `0x${string}` | undefined;
    const serverWallet = getServerWalletClient();
    
    if (templateType === 'COURSE') {
        const price = formData.get("price") as string;
        const priceInWei = parseEther(price);
        const symbol = `NEXA-${(title.substring(0, 4)).toUpperCase()}`;
        const paymentToken = "0x0000000000000000000000000000000000000000";

        const txHash = await serverWallet.writeContract({
            address: contracts.courseFactory.address,
            abi: contracts.courseFactory.abi,
            functionName: 'createCourse',
            args: [title, symbol, priceInWei, paymentToken, baseURI],
        });
        const receipt = await serverWallet.waitForTransactionReceipt({ hash: txHash });
        if (receipt.status === 'reverted') throw new Error("Gagal men-deploy kontrak kursus.");

        const logs = parseEventLogs({ abi: contracts.courseFactory.abi, logs: receipt.logs, eventName: 'CourseCreated' });
        newContractAddress = (logs[0] as DecodedLog).args.courseContract;

    } else { // templateType === 'CREDENTIAL'
        const symbol = formData.get("symbol") as string;
        if (!symbol) return { success: false, error: "Simbol wajib diisi untuk kredensial." };
        
        const txHash = await serverWallet.writeContract({
            address: contracts.userSbtFactory.address,
            abi: contracts.userSbtFactory.abi,
            functionName: 'createSbtContract',
            args: [title, symbol, user.address],
        });
        const receipt = await serverWallet.waitForTransactionReceipt({ hash: txHash });
        if (receipt.status === 'reverted') throw new Error("Gagal men-deploy kontrak kredensial.");
        
        const logs = parseEventLogs({ abi: contracts.userSbtFactory.abi, logs: receipt.logs, eventName: 'SBTContractCreated' });
        newContractAddress = (logs[0] as DecodedLog).args.newContractAddress;
    }

    if (!newContractAddress) throw new Error("Gagal mendapatkan alamat kontrak baru dari event.");

    const entity = await prisma.verifiedEntity.findUnique({ where: { walletAddress: user.address } });
    if (!entity) throw new Error("Entitas kreator tidak ditemukan.");

    await prisma.credentialTemplate.create({
      data: {
        templateType: templateType,
        title,
        description,
        imageUrl,
        contractAddress: newContractAddress.toLowerCase(),
        creatorId: entity.id,
        status: 'DRAFT',
        pricing: templateType === 'COURSE' ? {
          create: {
            type: Number(formData.get("price") as string) > 0 ? 'ONE_TIME' : 'FREE',
            price: parseFloat(formData.get("price") as string),
            currency: 'ETH',
          }
        } : undefined,
      },
    });

    revalidatePath("/dashboard/admin/verifiedUser");
    return { success: true };

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan.";
    console.error("[createAssetAction Error]", err);
    return { success: false, error: errorMessage };
  }
}