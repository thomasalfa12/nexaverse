// File: app/dashboard/(main)/profile/page.tsx

import { getAppSession } from "@/lib/auth";
import { prisma } from "@/lib/server/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, BadgeCheck, BookOpen, Trophy } from "lucide-react";

import { ProfileBanner } from "./_components/ProfileBanner";
import { ProfileContent } from "./_components/ProfileContent";
import { CopyButton } from "./_components/CopyButton";
import { truncateAddress } from "@/utils/formatAdd";
import { resolveIpfsUrl } from "@/utils/pinata";

import type {
  User,
  VerifiedEntity,
  Enrollment,
  CuratedCredential,
} from "@prisma/client";

// ... (Type exports tidak berubah)
export type ProfileUser = User & { verifiedEntity: VerifiedEntity | null };
export type EnrollmentWithCourse = Enrollment & {
  course: {
    id: string;
    title: string;
    imageUrl: string;
    creator: { name: string };
    _count: { modules: number };
  };
};
export type SbtWithIssuer = CuratedCredential & { issuer: { name: string } };

async function getProfileData(userId: string) {
  // ... (Fungsi getProfileData tidak berubah, sudah benar dari sebelumnya)
  const userPromise = prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      bio: true,
      email: true,
      emailVerified: true,
      image: true,
      coverImage: true,
      walletAddress: true,
      roles: true,
      entityId: true,
      verifiedEntity: true,
    },
  });
  const enrollmentsPromise = prisma.enrollment.findMany({
    where: { userId: userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          creator: { select: { name: true } },
          _count: { select: { modules: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });
  const credentialsPromise = prisma.curatedCredential.findMany({
    where: { userId: userId },
    include: { issuer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const [user, enrollments, credentials] = await Promise.all([
    userPromise,
    enrollmentsPromise,
    credentialsPromise,
  ]);
  return { user, enrollments, credentials };
}

export default async function ProfilePage() {
  const session = await getAppSession();
  if (!session?.user?.id) return notFound();

  const { user, enrollments, credentials } = await getProfileData(
    session.user.id
  );
  if (!user) return notFound();

  return (
    // Menggunakan bg-background dari globals.css
    <div className="min-h-screen bg-background">
      <ProfileBanner user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="-mt-16">
          <Avatar className="w-28 h-28 lg:w-32 lg:h-32 border-4 border-background bg-card shadow-lg">
            <AvatarImage
              src={resolveIpfsUrl(user.image)}
              alt={user.name ?? "Avatar"}
            />
            <AvatarFallback className="text-4xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mt-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                  {user.name}
                </h1>
                {user.verifiedEntity && (
                  <BadgeCheck className="w-7 h-7 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <p
                  className="text-sm text-muted-foreground font-mono"
                  title={user.walletAddress}
                >
                  {truncateAddress(user.walletAddress)}
                </p>
                <CopyButton textToCopy={user.walletAddress} />
              </div>
              {/* FIX: Statistik "Pills" menggunakan warna dari tema */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <div className="bg-secondary border rounded-full px-3 py-1 text-xs text-secondary-foreground flex items-center gap-2">
                  <BookOpen size={14} />
                  <span className="font-medium">{enrollments.length}</span>{" "}
                  Kursus
                </div>
                <div className="bg-secondary border rounded-full px-3 py-1 text-xs text-secondary-foreground flex items-center gap-2">
                  <Trophy size={14} />
                  <span className="font-medium">{credentials.length}</span>{" "}
                  Kredensial
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 pt-2">
              <Button>
                <Pencil className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-base text-muted-foreground max-w-2xl">
              {user.bio ||
                "Pengguna ini belum menulis bio. Klik 'Edit Profile' untuk menambahkan bio Anda."}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8">
          <ProfileContent enrollments={enrollments} credentials={credentials} />
        </div>
      </main>
    </div>
  );
}
