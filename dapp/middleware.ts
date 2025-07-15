// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const cookie = req.cookies.get("nexa_session")?.value;

  if (!cookie) return NextResponse.next();

  // Kamu bisa kirim permintaan backend → untuk deteksi institusi via JWT atau RPC
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/is-institution`, {
    headers: { Cookie: `nexa_session=${cookie}` },
  });
  const { isInstitution } = await res.json();

  if (url.pathname === "/dashboard") {
    if (isInstitution) {
      url.pathname = "/dashboard/institusi";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"],
};
