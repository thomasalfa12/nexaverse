// auth.config.ts (di root project)

import type { NextAuthConfig } from "next-auth";

// Konfigurasi dasar tanpa adapter (untuk middleware)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // Providers akan ditambahkan di auth.ts
} satisfies NextAuthConfig;