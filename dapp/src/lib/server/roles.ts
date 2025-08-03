// src/lib/server/roles.ts

import { createPublicClient, http } from "viem";
import { base, baseSepolia, linea, mainnet } from "viem/chains";
import { prisma } from "@/lib/server/prisma";
import { contracts, regAbi, verAbi } from "@/lib/contracts";

// --- Konfigurasi Klien Viem yang Tangguh ---
const viemHttpConfig = { timeout: 10_000, retryCount: 3 };
const baseClient = createPublicClient({ chain: base, transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL, viemHttpConfig) });
const lineaClient = createPublicClient({ chain: linea, transport: http(process.env.NEXT_PUBLIC_LINEA_RPC_URL, viemHttpConfig) });
const mainnetClient = createPublicClient({ chain: mainnet, transport: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL, viemHttpConfig) });
const contractClient = createPublicClient({ chain: baseSepolia, transport: http(process.env.NEXT_PUBLIC_RPC_URL, viemHttpConfig) });

/**
 * Mengambil data peran on-chain untuk alamat wallet tertentu dan melakukan
 * sinkronisasi "self-healing" jika data VerifiedEntity tidak ada di database.
 * @param address Alamat wallet pengguna.
 * @param chainId ID chain tempat pengguna login.
 * @returns Objek yang berisi array peran dan entityId jika ada.
 */
export async function getAndSyncOnchainData(address: `0x${string}`, chainId: number) {
  const roles: string[] = [];
  let entityId: number | null = null;
  const lowerCaseAddress = address.toLowerCase();

  try {
    const [ownerRegistry, balance] = await Promise.all([
      contractClient.readContract({ address: contracts.registry.address, abi: regAbi, functionName: 'owner' }) as Promise<`0x${string}`>,
      contractClient.readContract({ address: contracts.verified.address, abi: verAbi, functionName: 'balanceOf', args: [address] }) as Promise<bigint>,
    ]);

    if (lowerCaseAddress === ownerRegistry.toLowerCase()) {
      roles.push('REGISTRY_ADMIN');
    }

    if (balance > 0n) {
      roles.push('VERIFIED_ENTITY');
      
      let entityName: string | null = null;

      // FIX: Logika resolusi ENS sekarang benar-benar menggunakan chainId, baseClient, dan lineaClient
      const ensPromises: Promise<string | null>[] = [];
      
      // Prioritas 1: Cek nama spesifik jaringan aktif secara paralel
      if (chainId === base.id) {
        ensPromises.push(baseClient.getEnsName({ address }).catch(() => null));
      } else if (chainId === linea.id) {
        ensPromises.push(lineaClient.getEnsName({ address }).catch(() => null));
      }
      
      // Prioritas 2: Selalu cek .eth universal di Mainnet sebagai fallback
      ensPromises.push(mainnetClient.getEnsName({ address }).catch(() => null));

      const results = await Promise.all(ensPromises);
      entityName = results.find(name => name !== null) || null; // Ambil hasil pertama yang tidak null

      if(entityName) console.log(`Resolved name for ${address}: ${entityName}`);
      
      const finalEntityName = entityName || `Verified Entity ${address.slice(0, 6)}...`;

      const entity = await prisma.verifiedEntity.upsert({
        where: { walletAddress: lowerCaseAddress },
        update: { status: 'REGISTERED' },
        create: {
            walletAddress: lowerCaseAddress,
            name: finalEntityName,
            bio: "Please update your entity biography.",
            primaryUrl: "",
            contactEmail: "",
            entityType: 2, 
            status: 'REGISTERED',
        }
      });
      entityId = entity.id;
    }
  } catch (error) {
    console.error("Gagal mengambil atau menyinkronkan data on-chain:", error);
  }

  return { roles, entityId };
}
