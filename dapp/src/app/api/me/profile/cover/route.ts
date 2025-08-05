// File: app/api/profile/cover/route.ts

import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth";
import { prisma } from "@/lib/server/prisma";

export async function POST(req: Request) {
  try {
    const session = await getAppSession();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return new NextResponse("Bad Request: imageUrl is required", { status: 400 });
    }

    // Update field coverImage untuk user yang sedang login
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        coverImage: imageUrl,
      },
    });

    return NextResponse.json({ success: true, message: "Cover image updated." });

  } catch (error) {
    console.error("[API_COVER_UPDATE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}