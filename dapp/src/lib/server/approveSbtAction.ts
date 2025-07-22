// File: app/actions/approveSbtAction.ts

"use server";

import { prisma } from "@/lib/server/prisma";
import { VerifiedSbtClaimStatus, VerifiedEntity } from "@prisma/client";
import type { VerifiedSbtClaimProcess } from "@prisma/client";
import { getServerWalletClient } from "@/lib/server/wallet";
import { contracts } from "@/lib/contracts";
import { cidToBytes32 } from "@/lib/server/ipfs-utils";

export type SbtApprovalRequest = VerifiedSbtClaimProcess & {
  entity: VerifiedEntity;
};

// SINKRONISASI: Peta ini menerjemahkan `entityType` dari database ke string yang ramah pengguna.
const entityTypeMap: Record<number, string> = {
  1: "Institution",
  2: "Creator",
  3: "Community",
  4: "DAO",
};

function createVerifBadgeSVG(entityName: string, date: string): string {
  // ... (Kode SVG tidak berubah)
  return `
   <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style="font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;">
      <defs>
        <linearGradient id="modern-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2563eb;" />
          <stop offset="100%" style="stop-color:#3b82f6;" />
        </linearGradient>
        <radialGradient id="glow-grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style="stop-color:rgba(255, 255, 255, 0.15);" />
          <stop offset="100%" style="stop-color:rgba(255, 255, 255, 0);" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" rx="40" fill="url(#modern-grad)" />
      <rect width="400" height="400" rx="40" fill="url(#glow-grad)" />
      <g transform="translate(160, 40)">
        <path d="M40 0 L74.64 20 L74.64 60 L40 80 L5.36 60 L5.36 20 Z" fill="rgba(255, 255, 255, 0.9)"/>
        <path d="M25 40 L38 53 L55 30" stroke="#1e40af" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>
      <g text-anchor="middle" fill="white">
        <text x="50%" y="200" font-size="34" font-weight="bold">${entityName}</text>
        <text x="50%" y="235" font-size="16" font-weight="500" letter-spacing="2" style="text-transform:uppercase;" fill-opacity="0.8">VERIFIED ENTITY</text>
        <text x="50%" y="280" font-size="14" letter-spacing="4" fill-opacity="0.5">. . . . . . .</text>
        <g font-size="14" font-weight="400" fill-opacity="0.7">
          <text x="50%" y="320">Verified on: ${date}</text>
          <text x="50%" y="350">Issued by Nexaverse</text>
        </g>
      </g>
    </svg>
  `;
}

export async function approveSbt(req: SbtApprovalRequest): Promise<{ success: boolean; error?: string }> {
  try {
    const verificationDate = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
    const svgImage = createVerifBadgeSVG(req.entity.name, verificationDate);

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) throw new Error("PINATA_JWT tidak ditemukan.");

    const imageFormData = new FormData();
    imageFormData.append('file', new Blob([svgImage], { type: 'image/svg+xml' }), `${req.entity.walletAddress}.svg`);
    
    const imagePinResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', { /* ... */ });
    if (!imagePinResponse.ok) {
      const errorBody = await imagePinResponse.text();
      throw new Error(`Gagal mengunggah gambar ke Pinata. Status: ${imagePinResponse.status}. Respons: ${errorBody}`);
    }
    const { IpfsHash: imageCid } = await imagePinResponse.json();

    // --- PEMBUATAN METADATA DINAMIS ---
    const metadata = {
      name: `Nexaverse Verified: ${req.entity.name}`,
      description: "This Soulbound Token certifies that this entity has been officially verified by the Nexaverse platform.",
      image: `ipfs://${imageCid}`,
      attributes: [
        { 
          trait_type: "Entity Type",
          // FIX: Menggunakan `entityTypeMap` untuk mendapatkan nilai dinamis
          value: entityTypeMap[req.entity.entityType] ?? "General Entity"
        },
        { 
          trait_type: "Verification Date", 
          value: verificationDate 
        },
        {
          trait_type: "Primary URL",
          value: req.entity.primaryUrl
        }
      ]
    };

    const jsonFormData = new FormData();
    jsonFormData.append('file', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), `${req.entity.walletAddress}.json`);

    const jsonPinResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', { /* ... */ });
    if (!jsonPinResponse.ok) throw new Error("Gagal mengunggah metadata JSON.");
    const { IpfsHash: metadataCid } = await jsonPinResponse.json();

    // --- Sisa fungsi (Transaksi On-Chain & Sinkronisasi DB) tidak berubah ---
    const cidBytes32 = cidToBytes32(metadataCid);
    const serverWallet = getServerWalletClient();

    const txHash = await serverWallet.writeContract({
      address: contracts.verified.address,
      abi: contracts.verified.abi,
      functionName: "approveMintRequest",
      args: [req.entity.walletAddress, cidBytes32],
    });

    const receipt = await serverWallet.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status === 'reverted') throw new Error("Transaksi on-chain gagal (reverted).");

    await prisma.verifiedSbtClaimProcess.update({
      where: { id: req.id },
      data: {
        status: VerifiedSbtClaimStatus.APPROVED,
        cid: metadataCid,
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