// src/lib/auth.ts

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { createPublicClient, http } from "viem";
import { base, baseSepolia, linea, mainnet } from "viem/chains";
import { isEqual } from "lodash"; // Import lodash for deep comparison

import { prisma } from "@/lib/server/prisma";
import { contracts } from "@/lib/contracts";

// Tipe data kustom untuk hasil dari fungsi authorize
type AuthorizeResult = {
  id: string;
  walletAddress: string;
  roles: string[];
  entityId: number | null;
  name: string | null;
  image: string | null;
  email: string | null;
}

// =================================================================
// HELPER UNTUK PENGECEKAN PERAN (DENGAN RESOLUSI NAMA MULTI-CHAIN)
// =================================================================

const baseClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
});

const lineaClient = createPublicClient({
  chain: linea,
  transport: http(process.env.NEXT_PUBLIC_LINEA_RPC_URL),
});

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL),
});

const contractClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

async function getOnchainData(address: `0x${string}`, chainId: number) {
  const roles: string[] = [];
  let entityId: number | null = null;
  const lowerCaseAddress = address.toLowerCase();

  try {
    const [ownerRegistry, balance] = await Promise.all([
      contractClient.readContract({
        address: contracts.registry.address,
        abi: contracts.registry.abi,
        functionName: 'owner',
      }) as Promise<`0x${string}`>,
      contractClient.readContract({
        address: contracts.verified.address,
        abi: contracts.verified.abi,
        functionName: 'balanceOf',
        args: [address],
      }) as Promise<bigint>,
    ]);

    if (lowerCaseAddress === ownerRegistry.toLowerCase()) {
      roles.push('REGISTRY_ADMIN');
    }

    if (balance > 0n) {
      roles.push('VERIFIED_ENTITY');
      
      let entityName: string | null = null;

      try {
        if (chainId === base.id) {
            entityName = await baseClient.getEnsName({ address });
            if (entityName) console.log(`Resolved Base Name Service for ${address}: ${entityName}`);
        } else if (chainId === linea.id) {
            entityName = await lineaClient.getEnsName({ address });
            if (entityName) console.log(`Resolved Linea Name Service for ${address}: ${entityName}`);
        }
      } catch (l2EnsError) {
        console.warn(`Could not resolve L2 name for ${address}:`, l2EnsError);
      }

      if (!entityName) {
          try {
              entityName = await mainnetClient.getEnsName({ address });
              if (entityName) console.log(`Resolved Mainnet ENS for ${address}: ${entityName}`);
          } catch (mainnetEnsError) {
              console.warn(`Could not resolve Mainnet ENS for ${address}:`, mainnetEnsError);
          }
      }
      
      const finalEntityName = entityName || `Verified Entity ${address.slice(0, 6)}...`;

      const entity = await prisma.verifiedEntity.upsert({
        where: { walletAddress: lowerCaseAddress },
        update: { status: 'REGISTERED' },
        create: {
            walletAddress: lowerCaseAddress,
            name: finalEntityName,
            bio: "Please update your entity biography.",
            primaryUrl: "",
            contactEmail: "",
            entityType: 2, 
            status: 'REGISTERED',
        }
      });
      
      entityId = entity.id;
    }
  } catch (error) {
    console.error("Gagal mengambil atau menyinkronkan data on-chain:", error);
  }

  return { roles, entityId };
}

// =================================================================
// KONFIGURASI UTAMA NEXTAUTH.JS
// =================================================================

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
          const result = await siwe.verify({
            signature: credentials?.signature || "",
          });

          if (!result.success) throw new Error("Invalid signature.");

          const userAddress = result.data.address.toLowerCase();
          const chainId = result.data.chainId;

          // KUNCI PERBAIKAN: Panggil getOnchainData untuk SEMUA pengguna, baik baru maupun lama.
          const { roles: onchainRoles, entityId: onchainEntityId } = await getOnchainData(userAddress as `0x${string}`, chainId);

          let user = await prisma.user.findUnique({
            where: { walletAddress: userAddress },
          });

          // Jika pengguna tidak ada, buat baru.
          if (!user) {
            user = await prisma.user.create({
              data: {
                walletAddress: userAddress,
                roles: JSON.stringify(onchainRoles),
                entityId: onchainEntityId,
              },
            });
          } else {
            // Jika pengguna sudah ada, bandingkan data dan update jika perlu.
            const storedRoles = user.roles ? JSON.parse(user.roles) : [];
            const isDataStale = !isEqual(storedRoles.sort(), onchainRoles.sort()) || user.entityId !== onchainEntityId;

            if (isDataStale) {
              console.log(`Data usang untuk ${userAddress}. Memperbarui...`);
              user = await prisma.user.update({
                where: { walletAddress: userAddress },
                data: {
                  roles: JSON.stringify(onchainRoles),
                  entityId: onchainEntityId,
                },
              });
            }
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
        const latestUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
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

// Helper untuk mendapatkan sesi di server
export const getAppSession = () => getServerSession(authOptions);
