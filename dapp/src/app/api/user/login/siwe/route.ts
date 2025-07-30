// src/app/api/user/login/siwe/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { recoverMessageAddress, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/server/prisma"; // Impor Prisma Client
import { contracts } from "@/lib/contracts";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Mohon definisikan JWT_SECRET di .env.local");
}

const viemClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

function genNonce() {
  return [...crypto.getRandomValues(new Uint8Array(6))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET() {
  const nonce = genNonce();
  const res = NextResponse.json({ nonce });
  res.cookies.set("nexa_nonce", nonce, { httpOnly: true, maxAge: 300, sameSite: "lax" });
  return res;
}

export async function POST(req: Request) {
  try {
    const { message, signature } = await req.json();
    const nonce = (await cookies()).get("nexa_nonce")?.value;

    if (!nonce || !message.includes(nonce)) {
      return NextResponse.json({ ok: false, error: "Invalid nonce" }, { status: 400 });
    }

    const addr = await recoverMessageAddress({ message, signature });
    const userAddressLower = addr.toLowerCase(); // FIX: Definisikan di sini untuk digunakan di seluruh fungsi

    const roles: string[] = [];
    let entityId: number | null = null;

    // Cek role REGISTRY_ADMIN
    const ownerRegistry = await viemClient.readContract({
      address: contracts.registry.address,
      abi: contracts.registry.abi,
      functionName: 'owner',
    }) as `0x${string}`;

    if (userAddressLower === ownerRegistry.toLowerCase()) {
      roles.push("REGISTRY_ADMIN");
    }

    // Cek role VERIFIED_ENTITY
    const balance = await viemClient.readContract({
      address: contracts.verified.address,
      abi: contracts.verified.abi,
      functionName: 'balanceOf',
      args: [addr],
    }) as bigint;

    if (balance > 0n) {
      roles.push("VERIFIED_ENTITY");
      
      // Jika pengguna adalah VERIFIED_ENTITY, cari ID mereka di database.
      const entity = await prisma.verifiedEntity.findUnique({
        where: { 
          walletAddress: userAddressLower, // FIX: Gunakan variabel yang sudah didefinisikan
          status: 'REGISTERED' 
        },
        select: { id: true }
      });

      if (entity) {
        entityId = entity.id;
      }
    }
    
    // Buat payload yang lengkap dengan entityId
    const tokenPayload = { 
      address: addr, 
      roles,
      entityId: entityId
    };
    
    // FIX: Menambahkan non-null assertion (!) untuk meyakinkan TypeScript
    const token = jwt.sign(tokenPayload, JWT_SECRET!, { expiresIn: "1d" });
    
    const isProd = process.env.NODE_ENV === "production";
    const res = NextResponse.json({ ok: true });
    
    res.cookies.set("nexa_session", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/login",
    });
    res.cookies.delete("nexa_nonce");

    return res;
  } catch (error) {
    console.error("SIWE Login Error:", error);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
