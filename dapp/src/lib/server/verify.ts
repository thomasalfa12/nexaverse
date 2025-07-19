"use server";

import { prisma } from "@/lib/server/prisma";
import { RegistrationStatus, SbtStatus } from "@prisma/client";

/**
 * Tipe data yang dikembalikan untuk merepresentasikan status verifikasi pengguna
 * di seluruh alur aplikasi.
 */
export type VerifyStatus = {
  registered: boolean;
  requested: boolean;
  approved: boolean;
  claimed: boolean;
};

/**
 * Fungsi utama untuk mendapatkan status verifikasi lengkap seorang pengguna (institusi).
 * Ini adalah SATU-SATUNYA FUNGSI yang harus dipanggil oleh frontend (VerifyProgressTable)
 * untuk menentukan langkah mana yang harus ditampilkan kepada pengguna.
 */
export async function getVerifyStatus(address: `0x${string}`): Promise<VerifyStatus> {
  try {
    const lowercasedAddress = address.toLowerCase();

    // Lakukan SATU kueri efisien untuk mendapatkan semua data yang kita butuhkan.
    const institution = await prisma.institution.findUnique({
      where: { walletAddress: lowercasedAddress },
      include: {
        SbtMint: true, // Sertakan data SbtMint yang berelasi
      },
    });

    // Jika tidak ada data institusi, berarti pengguna belum melakukan apa-apa.
    if (!institution) {
      return { registered: false, requested: false, approved: false, claimed: false };
    }

    const sbtRequest = institution.SbtMint;

    // Kembalikan status yang sepenuhnya berasal dari database kita.
    return {
      // 'registered' jika status di tabel Institution adalah REGISTERED.
      registered: institution.status === RegistrationStatus.REGISTERED,
      
      // 'requested' jika ada entri SbtMint yang terkait.
      requested: !!sbtRequest,
      
      // FIX: 'approved' harus true jika statusnya APPROVED ATAU SUDAH MELEWATINYA (CLAIMED).
      // Ini adalah perbaikan logika utama.
      approved: sbtRequest?.status === SbtStatus.APPROVED || sbtRequest?.status === SbtStatus.CLAIMED,
      
      // 'claimed' jika status di SbtMint adalah CLAIMED.
      claimed: sbtRequest?.status === SbtStatus.CLAIMED,
    };
  } catch (err) {
    console.error("[getVerifyStatus] error:", err);
    // Kembalikan status default jika terjadi error.
    return { registered: false, requested: false, approved: false, claimed: false };
  }
}