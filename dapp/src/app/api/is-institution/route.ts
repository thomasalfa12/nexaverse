import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { checkIsInstitution } from "@/lib/checkRegistryOnChain";

export async function GET() {
  const cookieStore = await cookies();
  const address = cookieStore.get("nexa_session")?.value;

  if (!address) return NextResponse.json({ ok: false });

   const isInstitution = await checkIsInstitution(address as `0x${string}`);
  return NextResponse.json({ ok: true, isInstitution });
}