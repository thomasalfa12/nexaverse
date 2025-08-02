// types/next-auth.d.ts (Sudah Diperbaiki)

import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

// Tipe User dari authorize callback (tidak perlu diubah)
interface User extends DefaultUser {
  walletAddress: string;
  roles: string[];
  entityId: number | null;
}

declare module "next-auth" {
  // Tipe untuk sesi di sisi klien (tidak perlu diubah)
  interface Session {
    user: {
      id: string;
      address: string;
      roles: string[];
      entityId: number | null;
      profileComplete: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  // FIX: Lengkapi tipe JWT dengan semua properti yang kita tambahkan
  interface JWT extends DefaultJWT {
    id: string;
    walletAddress: string;
    roles: string[];
    entityId: number | null;
    profileComplete: boolean;
    // 'name' sudah ada di DefaultJWT
    image?: string | null;
    email?: string | null;
  }
}