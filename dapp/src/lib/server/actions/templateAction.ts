// File: app/actions/templateActions.ts
"use server";

import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";
import { revalidatePath } from "next/cache";
import { getServerWalletClient } from "@/lib/server/wallet";
import { contracts } from "@/lib/contracts";
import { parseEventLogs, type Log } from "viem";

interface ActionResult {
  success: boolean;
  error?: string;
}

// FIX: Mendefinisikan tipe data yang kita harapkan dari event yang di-decode.
// Ini adalah "cheat sheet" untuk TypeScript.
type DecodedSBTContractCreatedLog = Log & {
  args: {
    newContractAddress?: `0x${string}`;
    owner?: `0x${string}`;
    name?: string;
    symbol?: string;
  }
}

export async function createTemplateAction(formData: FormData): Promise<ActionResult> {
  const { user } = await getAuth();
  if (!user?.address || !user.roles.includes("VERIFIED_ENTITY")) {
    return { success: false, error: "Unauthorized" };
  }

  const serverWallet = getServerWalletClient();

  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const symbol = formData.get("symbol") as string;
    const imageFile = formData.get("image") as File;

    if (!title || !description || !symbol || !imageFile || imageFile.size === 0) {
      return { success: false, error: "Semua field wajib diisi." };
    }
    if (imageFile.size > 1 * 1024 * 1024) {
      return { success: false, error: "Ukuran gambar tidak boleh melebihi 1MB." };
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) throw new Error("PINATA_JWT tidak ditemukan.");

    const imageFormData = new FormData();
    imageFormData.append('file', imageFile, imageFile.name);
    
    const imagePinResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${pinataJwt}` },
      body: imageFormData,
    });
    if (!imagePinResponse.ok) {
        const errorBody = await imagePinResponse.text();
        throw new Error(`Gagal mengunggah gambar ke Pinata: ${errorBody}`);
    }
    const { IpfsHash: imageCid } = await imagePinResponse.json();
    const imageUrl = `ipfs://${imageCid}`;

    const txHash = await serverWallet.writeContract({
      address: contracts.factory.address,
      abi: contracts.factory.abi,
      functionName: 'createSbtContract',
      args: [title, symbol, user.address],
    });

    const receipt = await serverWallet.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status === 'reverted') throw new Error("Gagal men-deploy kontrak UserSBT.");

    // FIX: Menggunakan ABI lengkap dari file Anda
    const logs = parseEventLogs({
        abi: contracts.factory.abi,
        logs: receipt.logs,
        eventName: 'SBTContractCreated'
    });
    
    if (logs.length === 0) {
        throw new Error("SBTContractCreated event tidak ditemukan dalam log transaksi.");
    }
    
    // FIX: Melakukan type casting yang aman
    const decodedLog = logs[0] as DecodedSBTContractCreatedLog;
    const newContractAddress = decodedLog.args.newContractAddress;

    if (!newContractAddress) {
        throw new Error("Gagal menemukan alamat kontrak baru dari argumen event.");
    }
    
    const entity = await prisma.verifiedEntity.findUnique({ where: { walletAddress: user.address } });
    if (!entity) throw new Error("Entitas tidak ditemukan.");

    await prisma.credentialTemplate.create({
      data: {
        title,
        description,
        imageUrl,
        contractAddress: newContractAddress.toLowerCase(),
        creatorId: entity.id,
      },
    });

    revalidatePath("/dashboard/verifiedUser");
    return { success: true };

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui.";
    console.error("[createTemplateAction Error]", err);
    return { success: false, error: errorMessage };
  }
}