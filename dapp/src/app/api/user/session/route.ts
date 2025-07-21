// src/app/api/user/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET() {
  // FIX: Tambahkan 'await' untuk mendapatkan cookies sebelum memanggil .get()
  const sessionToken = (await cookies()).get("nexa_session")?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userData = jwt.verify(sessionToken, JWT_SECRET!);
    return NextResponse.json(userData);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}