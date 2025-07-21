// src/app/api/user/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Hapus cookie sesi
  res.cookies.delete("nexa_session");
  return res;
}