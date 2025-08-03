// src/lib/auth.ts

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { isEqual } from "lodash";

import { prisma } from "@/lib/server/prisma";
// Impor helper spesialis kita
import { getAndSyncOnchainData } from "@/lib/server/roles";

// Tipe data kustom untuk kejelasan
type AuthorizeResult = {
  id: string;
  walletAddress: string;
  roles: string[];
  entityId: number | null;
  name: string | null;
  image: string | null;
  email: string | null;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials): Promise<AuthorizeResult | null> {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"));
          const result = await siwe.verify({ signature: credentials?.signature || "" });

          if (!result.success) throw new Error("Invalid signature.");

          const userAddress = result.data.address.toLowerCase();
          const chainId = result.data.chainId;

          // Panggil helper spesialis kita
          const { roles: onchainRoles, entityId: onchainEntityId } = await getAndSyncOnchainData(userAddress as `0x${string}`, chainId);

          // Logika sinkronisasi cerdas di dalam transaksi database
          const user = await prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
              where: { walletAddress: userAddress },
            });

            if (!existingUser) {
              return tx.user.create({
                data: { walletAddress: userAddress, roles: JSON.stringify(onchainRoles), entityId: onchainEntityId },
              });
            }

            const storedRoles = existingUser.roles ? JSON.parse(existingUser.roles) : [];
            const isDataStale = !isEqual(storedRoles.sort(), onchainRoles.sort()) || existingUser.entityId !== onchainEntityId;

            if (isDataStale) {
              return tx.user.update({
                where: { walletAddress: userAddress },
                data: { roles: JSON.stringify(onchainRoles), entityId: onchainEntityId },
              });
            }
            
            return existingUser;
          });

          return {
            id: user.id,
            walletAddress: user.walletAddress,
            roles: user.roles ? JSON.parse(user.roles) : [],
            entityId: user.entityId,
            name: user.name,
            image: user.image,
            email: user.email,
          };
        } catch (e) {
          console.error("SIWE Authorize Error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const customUser = user as AuthorizeResult;
        token.id = customUser.id;
        token.walletAddress = customUser.walletAddress;
        token.roles = customUser.roles;
        token.entityId = customUser.entityId;
        token.name = customUser.name;
        token.image = customUser.image;
        token.email = customUser.email;
      }
      if (trigger === "update" && session) {
        const latestUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (latestUser) {
          token.name = latestUser.name;
          token.image = latestUser.image;
          token.email = latestUser.email;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.address = token.walletAddress as string;
        session.user.roles = token.roles as string[];
        session.user.entityId = token.entityId as number | null;
        session.user.name = token.name as string | null;
        session.user.image = token.image as string | null;
        session.user.email = token.email as string | null;
        session.user.profileComplete = !!token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const getAppSession = () => getServerSession(authOptions);
