// File: app/actions/eligibilityActions.ts
"use server";

import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";
import { revalidatePath } from "next/cache";

// Tipe data untuk hasil yang dikembalikan oleh action
interface ActionResult {
  success: boolean;
  error?: string;
  addedCount?: number;
}

/**
 * Server Action untuk menambahkan daftar alamat wallet ke daftar kelayakan
 * sebuah Credential Template.
 */
export async function addEligibleAddresses(
  templateId: string,
  walletAddresses: string[]
): Promise<ActionResult> {
  try {
    // 1. Otentikasi: Pastikan pengguna adalah entitas terverifikasi
    const { user } = await getAuth();
    if (!user?.address || !user.roles.includes("VERIFIED_ENTITY")) {
      throw new Error("Unauthorized");
    }

    // 2. Otorisasi: Pastikan pengguna ini adalah pemilik dari templat yang akan diubah
    const template = await prisma.credentialTemplate.findFirst({
      where: {
        id: templateId,
        creator: {
          walletAddress: user.address,
        },
      },
    });

    if (!template) {
      return { success: false, error: "Templat tidak ditemukan atau Anda tidak memiliki izin." };
    }

    // 3. Validasi & Persiapan Data
    const validAddresses = walletAddresses
      .map(addr => addr.trim().toLowerCase())
      .filter(addr => /^0x[a-fA-F0-9]{40}$/.test(addr));

    if (validAddresses.length === 0) {
      return { success: false, error: "Tidak ada alamat wallet yang valid untuk ditambahkan." };
    }
    
    const recordsToCreate = validAddresses.map(address => ({
      templateId: templateId,
      userWalletAddress: address,
      status: "ELIGIBLE",
    }));

    // 4. Simpan ke Database (mengabaikan duplikat secara otomatis)
    const result = await prisma.eligibilityRecord.createMany({
      data: recordsToCreate,
      skipDuplicates: true,
    });

    // 5. Revalidasi path agar data di halaman detail diperbarui
    revalidatePath(`/dashboard/verifiedUser`);

    return { success: true, addedCount: result.count };

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui.";
    console.error("[addEligibleAddresses Action Error]", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Server Action untuk mengambil daftar kelayakan untuk sebuah templat.
 * Digunakan oleh `TemplateDetailView` untuk menampilkan tabel.
 */
export async function getEligibilityList(templateId: string) {
    try {
        const { user } = await getAuth();
        if (!user?.address) throw new Error("Unauthorized");

        // Kueri ini juga memastikan hanya pemilik yang bisa melihat daftar
        const records = await prisma.eligibilityRecord.findMany({
            where: {
                templateId: templateId,
                template: {
                    creator: {
                        walletAddress: user.address
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100, // Batasi pengambilan data untuk performa
        });
        return records;
    } catch (error) {
        console.error("Failed to fetch eligibility list:", error);
        return [];
    }
}
