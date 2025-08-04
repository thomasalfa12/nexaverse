// src/lib/auth.ts

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SiweMessage } from 'siwe';
import { isEqual } from 'lodash';

import { prisma } from '@/lib/server/prisma';
import { getAndSyncOnchainData } from '@/lib/server/roles';

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

// Konfigurasi NextAuth v5
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 jam
    updateAge: 24 * 60 * 60, // Update session setiap 24 jam
  },
  jwt: {
    maxAge: 24 * 60 * 60, // JWT berlaku 24 jam
  },
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: { type: "text" },
        signature: { type: "text" },
      },
      async authorize(credentials): Promise<AuthorizeResult | null> {
        try {
          if (typeof credentials?.message !== 'string' || typeof credentials?.signature !== 'string') {
            throw new Error("Pesan atau tanda tangan tidak valid.");
          }
          
          const siwe = new SiweMessage(JSON.parse(credentials.message));
          const result = await siwe.verify({ signature: credentials.signature });

          if (!result.success) throw new Error("Tanda tangan tidak valid.");

          const userAddress = result.data.address.toLowerCase();
          const chainId = result.data.chainId;

          const { roles: onchainRoles, entityId: onchainEntityId } = await getAndSyncOnchainData(userAddress as `0x${string}`, chainId);

          const user = await prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({ where: { walletAddress: userAddress } });
            if (!existingUser) {
              return tx.user.create({ 
                data: { 
                  walletAddress: userAddress, 
                  roles: JSON.stringify(onchainRoles), 
                  entityId: onchainEntityId 
                } 
              });
            }
            const storedRoles = existingUser.roles ? JSON.parse(existingUser.roles) : [];
            const isDataStale = !isEqual(storedRoles.sort(), onchainRoles.sort()) || existingUser.entityId !== onchainEntityId;
            if (isDataStale) {
              return tx.user.update({ 
                where: { walletAddress: userAddress }, 
                data: { 
                  roles: JSON.stringify(onchainRoles), 
                  entityId: onchainEntityId 
                } 
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
    async jwt({ token, user, trigger }) {
      // Saat pertama kali sign-in
      if (user) {
        const customUser = user as AuthorizeResult;
        token.id = customUser.id;
        token.walletAddress = customUser.walletAddress;
        token.roles = customUser.roles;
        token.entityId = customUser.entityId;
        token.name = customUser.name;
        token.image = customUser.image;
        token.email = customUser.email;
        return token;
      }

      // HANYA ambil data terbaru saat trigger update (bukan setiap session check)
      if (trigger === "update" && token.id) {
        try {
          const latestUser = await prisma.user.findUnique({ 
            where: { id: token.id as string },
            select: {
              name: true,
              image: true,
              email: true,
            }
          });
          if (latestUser) {
            token.name = latestUser.name;
            token.image = latestUser.image;
            token.email = latestUser.email;
          }
        } catch (error) {
          console.error("Error fetching user data in JWT callback:", error);
          // Jangan throw error, return token yang ada
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        try {
          // Menggunakan Object.assign untuk menghindari type error
          Object.assign(session.user, {
            id: token.id,
            address: token.walletAddress || '',
            roles: token.roles || [],
            entityId: token.entityId || null,
            name: token.name || null,
            image: token.image || null,
            email: token.email || null,
            profileComplete: !!token.name,
          });
        } catch (error) {
          console.error("Error in session callback:", error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  // Matikan debug sepenuhnya
  debug: false,
});

// Export handlers untuk API routes
export const { GET, POST } = handlers;

// Jembatan kompatibilitas
export const getAppSession = auth;