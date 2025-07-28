
import { NextResponse } from "next/server";
import { createPublicClient, http, isAddress } from "viem";
import { baseSepolia } from "viem/chains"; // Ganti dengan chain yang relevan
import { erc721Abi } from "viem"; // ABI standar untuk ERC721

// Ganti dengan RPC URL Anda dari Alchemy/Infura
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL; 

export async function GET(
  req: Request,
  { params }: { params: { contractAddress: string } }
) {
  if (!RPC_URL) {
    return NextResponse.json({ error: "RPC URL tidak terkonfigurasi" }, { status: 500 });
  }
  if (!params.contractAddress || !isAddress(params.contractAddress)) {
    return NextResponse.json({ error: "Alamat kontrak tidak valid" }, { status: 400 });
  }

  try {
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC_URL) });

    // Ambil total supply untuk mengetahui berapa banyak token yang ada
    const totalSupply = await publicClient.readContract({
      address: params.contractAddress as `0x${string}`,
      abi: erc721Abi,
      functionName: 'totalSupply',
    });

    // Ambil pemilik untuk setiap tokenId
    const ownerPromises = [];
    // Batasi hingga 1000 untuk mencegah timeout, sesuaikan jika perlu
    const limit = totalSupply > 1000n ? 1000n : totalSupply;

    for (let i = 1n; i <= limit; i++) {
      ownerPromises.push(
        publicClient.readContract({
          address: params.contractAddress as `0x${string}`,
          abi: erc721Abi,
          functionName: 'ownerOf',
          args: [i],
        })
      );
    }
    
    const owners = await Promise.all(ownerPromises);
    const uniqueOwners = [...new Set(owners)];

    return NextResponse.json({ holders: uniqueOwners });
  } catch (error) {
    console.error("Snapshot error:", error);
    return NextResponse.json({ error: "Gagal mengambil data holder. Pastikan alamat kontrak benar dan mendukung ERC721." }, { status: 500 });
  }
}