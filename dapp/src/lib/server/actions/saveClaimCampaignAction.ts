"use server";

import { prisma } from "@/lib/server/prisma";
import { getAppSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface SaveResult { success: boolean; error?: string; }
interface CampaignData {
  title: string;
  description: string;
  imageUrl: string;
  contractAddress: string;
  merkleRoot: string;
  metadataUri: string;
  eligibleWallets: string[];
}

export async function saveClaimCampaignAction(data: CampaignData): Promise<SaveResult> {
    console.log("\n--- [ACTION START] Memulai saveClaimCampaignAction ---");
    console.log("Data yang diterima:", JSON.stringify(data, null, 2));

    try {
        console.log("Langkah 1: Mencoba memanggil getAuth()...");
        const session = await getAppSession();
        console.log(" -> getAuth() berhasil.");

        if (!session?.user?.address || !session.user.entityId) {
            console.error("[ACTION FAIL] Gagal otentikasi pengguna.");
            return { success: false, error: "Unauthorized" };
        }
        console.log(`Langkah 2: Pengguna diautentikasi: ${session.user.address} (Entity ID: ${session.user.entityId})`);

        // Kita akan coba membuat template di luar transaksi terlebih dahulu
        console.log("Langkah 3: Mencoba membuat CredentialTemplate...");
        const newCredential = await prisma.credential.create({ // GANTI DI SINI
            data: {
        // templateType: 'CREDENTIAL', // Hapus baris ini
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        contractAddress: data.contractAddress,
        creatorId: session.user.entityId,
        merkleRoot: data.merkleRoot,
    }
});

        console.log(` -> CredentialTemplate berhasil dibuat dengan ID: ${newCredential.id}`);

        console.log("Langkah 4: Menyiapkan data EligibilityRecord...");
        const eligibilityData = data.eligibleWallets.map(walletAddress => ({
    userWalletAddress: walletAddress.toLowerCase(),
    credentialId: newCredential.id, // GANTI DI SINI
    status: "ELIGIBLE"
}));
        console.log(` -> Disiapkan ${eligibilityData.length} catatan untuk dibuat.`);

        console.log("Langkah 5: Mencoba membuat EligibilityRecord secara massal...");
  const createManyResult = await prisma.eligibilityRecord.createMany({
            data: eligibilityData,
            skipDuplicates: true
        });
        console.log(` -> createMany berhasil, membuat ${createManyResult.count} catatan baru.`);

        revalidatePath("/dashboard/claims");
        console.log("--- [ACTION SUCCESS] saveClaimCampaignAction selesai dengan sukses ---");
        return { success: true };
    } catch (err) {
        // Jika error terjadi, sekarang PASTI akan tertangkap dan ditampilkan di sini.
        console.error("!!! [ACTION FAIL] Terjadi error fatal di dalam saveClaimCampaignAction:", err);
        return { success: false, error: (err as Error).message };
    }
}