// types/next-auth.d.ts

import "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      address: string;
      roles: string[];
      entityId: number | null;
      profileComplete: boolean; // Flag baru kita
    } & DefaultSession["user"];
  }

  interface User {
    walletAddress: string;
    roles: string[];
    entityId: number | null;
    name?: string | null; // Tambahkan nama di sini
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    walletAddress: string;
    roles: string[];
    entityId: number | null;
    name?: string | null;
  }
}