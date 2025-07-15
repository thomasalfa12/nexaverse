// src/app/api/admin/signed/route.ts
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const signedStore: any[] = [];

export async function POST(req: NextRequest) {
  const body = await req.json();
  signedStore.push(body); // store temporarily in memory
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json(signedStore);
}
