import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth";
import { pusherServer } from "@/lib/server/pusher";

export async function POST(req: Request) {
  try {
    const session = await getAppSession();

    // Tolak jika pengguna tidak login
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.formData();
    const socketId = body.get("socket_id") as string;
    const channel = body.get("channel_name") as string;

    // Pastikan channel yang diminta adalah channel privat milik pengguna itu sendiri
    const expectedChannelName = `private-user-${session.user.id}`;
    if (channel !== expectedChannelName) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const userData = {
      user_id: session.user.id,
    };
    
    // Otorisasi langganan ke channel
    const authResponse = pusherServer.authorizeChannel(socketId, channel, userData);
    
    return NextResponse.json(authResponse);

  } catch (error) {
    console.error("Pusher auth error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}