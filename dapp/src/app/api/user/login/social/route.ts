// src/app/api/user/login/social/route.ts
import { NextResponse } from "next/server";
import { createPublicClient, http, isAddress } from "viem";
import { baseSepolia } from "viem/chains";
import jwt from "jsonwebtoken";

import { contracts } from "@/lib/contracts";

const JWT_SECRET = process.env.JWT_SECRET!;
const viemClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address || !isAddress(address)) {
      return NextResponse.json({ ok: false, error: "Invalid address provided" }, { status: 400 });
    }

    const roles: string[] = [];
    
    // FIX: Lakukan type assertion pada hasil readContract menjadi `0x${string}`
    const verifiedEntitySBTOwner = await viemClient.readContract({
         address: contracts.verified.address, // <-- Gunakan kontrak institusi
         abi: contracts.verified.abi,
         functionName: 'owner',
       }) as `0x${string}`;
   
       if (address.toLowerCase() === verifiedEntitySBTOwner.toLowerCase()) {
         roles.push("VERIFIED_ENTITY");
       }
   

    const tokenPayload = { address, roles };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1d" });
    
    const isProd = process.env.NODE_ENV === "production";
    const res = NextResponse.json({ ok: true });
    
    res.cookies.set("nexa_session", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Social Login Error:", error);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}