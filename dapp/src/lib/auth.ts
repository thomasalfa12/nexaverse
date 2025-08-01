// src/lib/auth.ts

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { prisma } from "@/lib/server/prisma";
import { getOnchainData } from "@/lib/server/roles";

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
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"));
          const result = await siwe.verify({
            signature: credentials?.signature || "",
          });

          if (!result.success) throw new Error("Invalid signature.");

          const userAddress = result.data.address.toLowerCase();
          let user = await prisma.user.findUnique({
            where: { walletAddress: userAddress },
          });

          if (!user) {
            const { roles, entityId } = await getOnchainData(userAddress as `0x${string}`);
            user = await prisma.user.create({
              data: {
                walletAddress: userAddress,
                roles: JSON.stringify(roles),
                entityId: entityId,
              },
            });
          }

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
      // Saat pertama kali sign-in, teruskan data ke token
      if (user) {
        token.id = user.id;
        token.walletAddress = user.walletAddress;
        token.roles = user.roles;
        token.entityId = user.entityId;
        token.name = user.name;
        token.image = user.image;
        token.email = user.email;
      }

      // KUNCI PERBAIKAN: Saat fungsi `update()` dipanggil dari client
      if (trigger === "update" && session) {
        console.log("JWT update triggered, fetching latest user data from DB...");
        const latestUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (latestUser) {
          // Perbarui token dengan data terbaru dari database
          token.name = latestUser.name;
          token.image = latestUser.image;
          token.email = latestUser.email;
          console.log("Token updated with new name:", token.name);
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

// Helper untuk mendapatkan sesi di server
export const getAppSession = () => getServerSession(authOptions);
