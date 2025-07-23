// File: services/factoryListener.ts
// Jalankan file ini sebagai proses background terpisah di server Anda.
// Perintah: `npm run listen:factory`

// FIX: Konfigurasi `dotenv` secara eksplisit untuk membaca file `.env.local`
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });


import { createPublicClient, webSocket, decodeEventLog, Address } from "viem";
import { baseSepolia } from "viem/chains";
import { prisma } from "@/lib/server/prisma";
import { contracts } from "@/lib/contracts";

// Tipe data eksplisit untuk argumen event
type SbtContractCreatedEventArgs = {
  newContractAddress: Address;
  owner: Address;
  name: string;
  symbol: string;
};

const wssRpcUrl = process.env.NEXT_PUBLIC_WSS_RPC_URL;
if (!wssRpcUrl) {
    throw new Error("NEXT_PUBLIC_WSS_RPC_URL tidak ditemukan di .env.local. Listener memerlukan koneksi WebSocket.");
}

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: webSocket(wssRpcUrl),
});

console.log("🚀 [Listener] Memulai listener untuk event SBTContractCreated via WebSocket...");

publicClient.watchContractEvent({
  abi: contracts.factory.abi,
  address: contracts.factory.address,
  eventName: 'SBTContractCreated',
  
  onLogs: async (logs) => {
    console.log("✅ [Listener] Event SBTContractCreated terdeteksi!", logs);

    for (const log of logs) {
      try {
        const decodedLog = decodeEventLog({
          abi: contracts.factory.abi,
          data: log.data,
          topics: log.topics,
          eventName: 'SBTContractCreated'
        });

        const args = decodedLog.args as unknown as SbtContractCreatedEventArgs;

        if (!args.newContractAddress || !args.owner || !args.name || !args.symbol) {
          console.warn("[Listener] Event tidak memiliki argumen yang lengkap. Dilewati.", log);
          continue;
        }
        
        const entity = await prisma.verifiedEntity.findUnique({
          where: { walletAddress: args.owner.toLowerCase() },
        });

        if (!entity) {
          console.warn(`[Listener] Entitas terverifikasi tidak ditemukan untuk alamat ${args.owner}. Event dilewati.`);
          continue;
        }
        
        await prisma.credentialTemplate.create({
          data: {
            title: args.name,
            description: `Kredensial untuk ${args.name} (${args.symbol})`,
            imageUrl: "https://placehold.co/600x600/cccccc/ffffff?text=Image",
            contractAddress: args.newContractAddress.toLowerCase(),
            creatorId: entity.id,
          },
        });

        console.log(`💾 [Listener] Templat baru "${args.name}" dengan alamat kontrak ${args.newContractAddress} berhasil disimpan untuk ${args.owner}.`);

      } catch (error) {
        if (error instanceof Error && error.message.includes("Unique constraint failed")) {
            console.warn(`[Listener] Templat untuk event ini sudah ada. Dilewati.`);
        } else {
            console.error(`[Listener] Gagal memproses log event:`, error);
        }
      }
    }
  },
  onError: (error) => {
    console.error("[Listener] Terjadi error pada listener:", error);
  }
});
