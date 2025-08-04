"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import { toast } from "sonner";

export function WebSocketProvider() {
  const { data: session, status, update } = useSession();
  const isUpdatingRef = useRef(false);

  // Gunakan useMemo untuk inisialisasi Pusher hanya sekali
  const pusherClient = useMemo(() => {
    if (typeof window !== "undefined") {
      return new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: "/api/pusher/auth",
      });
    }
    return null;
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id || !pusherClient) {
      return;
    }

    const channelName = `private-user-${session.user.id}`;

    try {
      const channel = pusherClient.subscribe(channelName);

      channel.bind("session:refresh", async () => {
        // Prevent multiple simultaneous updates
        if (isUpdatingRef.current) {
          console.log("[PUSHER] Update already in progress, skipping...");
          return;
        }

        console.log(
          "[PUSHER] 🔔 Sinyal session:refresh diterima, memanggil update()..."
        );

        isUpdatingRef.current = true;

        try {
          toast.info("Sesi Anda sedang disinkronkan...");
          console.log("[PUSHER] 📡 Calling session update...");
          await update(); // Memicu NextAuth untuk mengambil data sesi terbaru
          console.log("[PUSHER] ✅ Session update completed successfully");
          toast.success("Profil berhasil disinkronkan!");
        } catch (error) {
          console.error("[PUSHER] ❌ Error updating session:", error);
          toast.error("Gagal menyinkronkan profil");
        } finally {
          // Reset flag setelah delay untuk mencegah spam
          setTimeout(() => {
            isUpdatingRef.current = false;
            console.log("[PUSHER] 🔓 Update lock released");
          }, 2000);
        }
      });

      console.log(`[PUSHER] Subscribed to channel: ${channelName}`);
    } catch (error) {
      console.error("Gagal berlangganan channel Pusher:", error);
    }

    // Cleanup saat komponen di-unmount atau user berubah
    return () => {
      if (pusherClient) {
        console.log(`[PUSHER] Unsubscribing from channel: ${channelName}`);
        pusherClient.unsubscribe(channelName);
      }
    };
  }, [status, session?.user?.id, update, pusherClient]); // Dependency yang lebih spesifik

  return null; // Komponen ini tidak me-render UI
}
