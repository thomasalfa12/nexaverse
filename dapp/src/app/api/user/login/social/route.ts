import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { address } = await req.json();
  if (!address) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set("nexa_session", address, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return res;
}