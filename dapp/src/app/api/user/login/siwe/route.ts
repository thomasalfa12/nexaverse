// src/app/api/siwe/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { recoverMessageAddress } from "viem";

function genNonce() {
  return [...crypto.getRandomValues(new Uint8Array(6))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ---------------------  GET /api/siwe   --------------------- */
export async function GET() {
  const nonce = genNonce();

  /* buat respons + tulis cookie di sana */
  const res = NextResponse.json({ nonce });
  res.cookies.set("nexa_nonce", nonce, {
    httpOnly: true,
    maxAge: 300,
    sameSite: "lax",
  });
  return res;
}

/* ---------------------  POST /api/siwe  --------------------- */
export async function POST(req: Request) {
  const { message, signature } = await req.json();

  /* ⬇️  baca cookie permintaan */
  const reqCookies = await cookies();        // <- pakai await
  const nonce = reqCookies.get("nexa_nonce")?.value;

  if (!nonce || !message.includes(nonce))
    return NextResponse.json({ ok: false }, { status: 400 });

  const addr = await recoverMessageAddress({ message, signature });

  /* set session + hapus nonce di objek respons */
  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true });
  res.cookies.set("nexa_session", addr, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  res.cookies.delete("nexa_nonce");
  return res;
}
