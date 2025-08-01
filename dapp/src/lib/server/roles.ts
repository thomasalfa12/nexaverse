// src/lib/server/roles.ts

import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { prisma } from "@/lib/server/prisma";
import { contracts } from "@/lib/contracts";

const viemClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

/**
 * Mengambil data peran on-chain untuk alamat wallet tertentu.
 * @param address Alamat wallet pengguna.
 * @returns Objek yang berisi array peran dan entityId jika ada.
 */
export async function getOnchainData(address: `0x${string}`) {
  const roles: string[] = [];
  let entityId: number | null = null;
  const lowerCaseAddress = address.toLowerCase();

  try {
    // Jalankan pengecekan on-chain secara paralel untuk performa maksimal
    const [ownerRegistry, balance] = await Promise.all([
      viemClient.readContract({
        address: contracts.registry.address,
        abi: contracts.registry.abi,
        functionName: 'owner',
      }) as Promise<`0x${string}`>,
      viemClient.readContract({
        address: contracts.verified.address,
        abi: contracts.verified.abi,
        functionName: 'balanceOf',
        args: [address],
      }) as Promise<bigint>,
    ]);

    // 1. Tambahkan peran REGISTRY_ADMIN jika alamat cocok dengan owner kontrak
    if (lowerCaseAddress === ownerRegistry.toLowerCase()) {
      roles.push('REGISTRY_ADMIN');
    }

    // 2. Tambahkan peran VERIFIED_ENTITY jika memiliki balance > 0
    if (balance > 0n) {
      roles.push('VERIFIED_ENTITY');
      // Jika merupakan entitas, cari ID-nya di database
      const entity = await prisma.verifiedEntity.findUnique({
        where: { walletAddress: lowerCaseAddress, status: 'REGISTERED' },
        select: { id: true },
      });
      if (entity) {
        entityId = entity.id;
      }
    }
  } catch (error) {
    console.error("Gagal mengambil data on-chain:", error);
    // Kembalikan array kosong jika terjadi error, agar tidak menghentikan proses login
  }

  return { roles, entityId };
}
