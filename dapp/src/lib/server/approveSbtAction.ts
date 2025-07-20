"use server";

import { prisma } from "@/lib/server/prisma";
import { SbtStatus } from "@prisma/client";
import type { SbtMintWithInstitution } from "@/components/admin/RequestSBTTable";
import { getServerWalletClient } from "./wallet"
import { contracts } from "@/lib/contracts";
import { cidToBytes32 } from "@/lib/server/ipfs-utils";

// Helper untuk membuat gambar SVG dinamis
function createVerifBadgeSVG(institutionName: string, date: string): string {
  // Desain badge bisa Anda kustomisasi sesuka hati
  return `
   <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style="font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;">
  <defs>
    <!-- Gradien biru yang bersih dan modern untuk latar belakang -->
    <linearGradient id="modern-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;" />
      <stop offset="100%" style="stop-color:#3b82f6;" />
    </linearGradient>

    <!-- Gradien cahaya halus dari tengah -->
    <radialGradient id="glow-grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" style="stop-color:rgba(255, 255, 255, 0.15);" />
      <stop offset="100%" style="stop-color:rgba(255, 255, 255, 0);" />
    </radialGradient>
  </defs>

  <!-- Latar Belakang Utama -->
  <rect width="400" height="400" rx="40" fill="url(#modern-grad)" />
  <!-- Lapisan Efek Cahaya -->
  <rect width="400" height="400" rx="40" fill="url(#glow-grad)" />

  <!-- Ikon Verifikasi Utama -->
  <g transform="translate(160, 40)">
    <!-- Latar belakang ikon -->
    <path d="M40 0 L74.64 20 L74.64 60 L40 80 L5.36 60 L5.36 20 Z" fill="rgba(255, 255, 255, 0.9)"/>
    <!-- Tanda Centang -->
    <path d="M25 40 L38 53 L55 30" stroke="#1e40af" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>

  <!-- Konten Teks -->
  <g text-anchor="middle" fill="white">
    <!-- Nama Institusi (Pahlawan Utama) -->
    <text x="50%" y="200" font-size="34" font-weight="bold">
      ${institutionName}
    </text>

    <!-- Status Verifikasi -->
    <text x="50%" y="235" font-size="16" font-weight="500" letter-spacing="2" style="text-transform:uppercase;" fill-opacity="0.8">
      VERIFIED INSTITUTION
    </text>

    <!-- Garis pemisah halus -->
    <text x="50%" y="280" font-size="14" letter-spacing="4" fill-opacity="0.5">. . . . . . .</text>

    <!-- Informasi Sekunder -->
    <g font-size="14" font-weight="400" fill-opacity="0.7">
      <text x="50%" y="320">
        Verified on: ${date}
      </text>
      <text x="50%" y="350">
        Issued by Nexaverse
      </text>
    </g>
  </g>
</svg>
  `;
}

// SERVER ACTION UTAMA
export async function approveSbt(req: SbtMintWithInstitution): Promise<{ success: boolean; error?: string }> {
  try {
    // --- TAHAP 1: PEMBUATAN METADATA & UPLOAD KE IPFS ---
    
    // a. Buat gambar SVG dinamis
    const verificationDate = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
    const svgImage = createVerifBadgeSVG(req.institution.name, verificationDate);

    // b. Upload gambar SVG ke Pinata
    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) throw new Error("PINATA_JWT tidak ditemukan di environment variables.");

    const imageFormData = new FormData();
    imageFormData.append('file', new Blob([svgImage], { type: 'image/svg+xml' }), `${req.institution.walletAddress}.svg`);
    
    const imagePinResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${pinataJwt}` },
      body: imageFormData,
    });
      if (!imagePinResponse.ok) {
      // Jika gagal, kita coba baca respons error dari Pinata
      const errorBody = await imagePinResponse.text(); // Gunakan .text() agar tidak gagal jika respons bukan JSON
      console.error("Pinata Image Upload Error Response:", errorBody);
      // Berikan pesan error yang lebih informatif
      throw new Error(`Gagal mengunggah gambar ke Pinata. Status: ${imagePinResponse.status}. Respons: ${errorBody}`);
    }

    const { IpfsHash: imageCid } = await imagePinResponse.json();

    // c. Buat file metadata JSON
    const metadata = {
      name: `Nexaverse Verified: ${req.institution.name}`,
      description: "This Soulbound Token certifies that this institution has been officially verified by the Nexaverse platform.",
      image: `ipfs://${imageCid}`,
      attributes: [
        { trait_type: "Institution Type", value: "Organization" }, // Ganti dengan tipe dinamis jika perlu
        { trait_type: "Verification Date", value: verificationDate }
      ]
    };

    // d. Upload metadata JSON ke Pinata
    const jsonFormData = new FormData();
    jsonFormData.append('file', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), `${req.institution.walletAddress}.json`);

    const jsonPinResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${pinataJwt}` },
        body: jsonFormData,
    });
    if (!jsonPinResponse.ok) throw new Error("Gagal mengunggah metadata JSON ke Pinata.");
    const { IpfsHash: metadataCid } = await jsonPinResponse.json();


    // --- TAHAP 2: KONVERSI CID & TRANSAKSI ON-CHAIN ---
    const cidBytes32 = cidToBytes32(metadataCid);
    const serverWallet = getServerWalletClient();

    const txHash = await serverWallet.writeContract({
      address: contracts.institution.address,
      abi: contracts.institution.abi,
      functionName: "approveMintRequest",
      args: [req.institution.walletAddress, cidBytes32],
    });

    const receipt = await serverWallet.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status === 'reverted') throw new Error("Transaksi on-chain gagal (reverted).");


    // --- TAHAP 3: SINKRONISASI KE DATABASE ---
    await prisma.sbtMint.update({
      where: { id: req.id },
      data: {
        status: SbtStatus.APPROVED,
        uri: `ipfs://${metadataCid}`,
        approvalTxHash: txHash,
        approvedAt: new Date(),
      },
    });

    return { success: true };

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui.";
    console.error("[approveSbt Action Error]", err);
    return { success: false, error: errorMessage };
  }
}
