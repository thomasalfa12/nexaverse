// types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      address: string;
      roles: string[];
      entityId: number | null;
      profileComplete: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    walletAddress: string;
    roles: string[];
    entityId: number | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    walletAddress?: string;
    roles?: string[];
    entityId?: number | null;
    profileComplete?: boolean;
  }
}