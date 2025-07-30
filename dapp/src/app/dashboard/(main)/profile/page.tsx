"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckBadgeIcon, PencilIcon } from "@heroicons/react/24/solid";
import { Loader2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type {
  Profile,
  CuratedCredential,
  VerifiedEntity,
  Enrollment,
  CredentialTemplate,
} from "@prisma/client";
import { Button } from "@/components/ui/button";

// --- Tipe Data Baru (Berdasarkan data asli dari Prisma) ---
type UserProfile = Profile & {
  isVerifiedInstitution: boolean;
};

type Sbt = CuratedCredential & {
  issuer: Pick<VerifiedEntity, "name">;
};

// Tipe baru untuk data pendaftaran
type EnrollmentWithCourse = Enrollment & {
  course: CredentialTemplate & {
    creator: Pick<VerifiedEntity, "name">;
  };
};

// --- Komponen-Komponen Kecil (Diadaptasi) ---

const SbtCard: React.FC<{ sbt: Sbt }> = ({ sbt }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="bg-white rounded-xl shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
  >
    <div className="aspect-square bg-gray-100 relative">
      <Image
        src={sbt.imageUrl}
        alt={sbt.title}
        fill
        className="object-cover"
        onError={(e) =>
          (e.currentTarget.src =
            "[https://placehold.co/600x600?text=Image](https://placehold.co/600x600?text=Image)")
        }
      />
    </div>
    <div className="p-5">
      <h3 className="font-bold text-gray-800 text-lg truncate">{sbt.title}</h3>
      <div className="flex items-center mt-2">
        <span className="text-sm text-gray-500">{sbt.issuer.name}</span>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        {new Date(sbt.createdAt).toLocaleDateString("id-ID")}
      </p>
    </div>
  </motion.div>
);

// Komponen baru untuk menampilkan kartu kursus yang diikuti
const EnrolledCourseCard: React.FC<{ enrollment: EnrollmentWithCourse }> = ({
  enrollment,
}) => (
  <Link
    href={`/dashboard/courses/${enrollment.course.id}/learn`}
    className="block"
  >
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="bg-white rounded-xl shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="aspect-video bg-gray-100 relative">
        <Image
          src={enrollment.course.imageUrl}
          alt={enrollment.course.title}
          fill
          className="object-cover"
          onError={(e) =>
            (e.currentTarget.src =
              "[https://placehold.co/600x400?text=Course](https://placehold.co/600x400?text=Course)")
          }
        />
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-800 text-lg truncate">
          {enrollment.course.title}
        </h3>
        <p className="text-sm text-gray-500 mt-2">
          oleh {enrollment.course.creator.name}
        </p>
        <div className="mt-3 flex justify-end">
          <Button variant="link" className="p-0 h-auto">
            Masuk ke Kelas
          </Button>
        </div>
      </div>
    </motion.div>
  </Link>
);

const ProfileHeader: React.FC<{ profile: UserProfile }> = ({ profile }) => (
  <header className="relative">
    <div className="h-48 md:h-64 bg-gray-200 rounded-b-2xl overflow-hidden relative">
      <Image
        src={
          "[https://placehold.co/1200x400/e0f2fe/3b82f6?text=](https://placehold.co/1200x400/e0f2fe/3b82f6?text=)+"
        }
        alt="Cover"
        fill
        className="object-cover"
      />
    </div>
    <div className="absolute top-32 md:top-40 left-1/2 -translate-x-1/2 w-full px-4">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white border-4 border-white shadow-lg -mt-16 md:-mt-20 overflow-hidden relative">
            <Image
              src={`https://placehold.co/128x128/3b82f6/ffffff?text=${
                profile.name?.charAt(0) || "P"
              }`}
              alt="Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div className="text-center md:text-left mt-2 md:mt-0 md:pt-8">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {profile.name}
              </h1>
              {profile.isVerifiedInstitution && (
                <CheckBadgeIcon
                  className="w-7 h-7 text-blue-500"
                  title="Institusi Terverifikasi"
                />
              )}
            </div>
            <p className="text-gray-500 font-mono text-sm mt-1">
              {profile.walletAddress}
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 md:pt-12">
          <button className="bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm border hover:bg-gray-100 transition-colors flex items-center gap-2">
            <PencilIcon className="w-4 h-4" /> Edit Profil
          </button>
        </div>
      </div>
    </div>
  </header>
);

// --- Komponen Utama Halaman Profil ---
export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sbts, setSbts] = useState<Sbt[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]); // State baru
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Ambil semua data secara paralel
        const [profileRes, sbtRes, enrollmentsRes] = await Promise.all([
          fetch("/api/me/profile"),
          fetch("/api/me/credentials"),
          fetch("/api/me/enrollments"), // Panggilan API baru
        ]);

        if (!profileRes.ok) throw new Error("Gagal memuat profil.");
        setProfile(await profileRes.json());

        if (sbtRes.ok) setSbts(await sbtRes.json());
        if (enrollmentsRes.ok) setEnrollments(await enrollmentsRes.json());
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-gray-500">
        Gagal memuat profil. Pastikan Anda sudah melengkapi profil Anda.
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        <ProfileHeader profile={profile} />
        <main className="pt-40 md:pt-32 p-4 md:px-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <p className="text-gray-700">{profile.bio}</p>
          </div>

          {/* Bagian Kursus yang Diikuti */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Kursus yang Diikuti
            </h2>
            {enrollments.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {enrollments.map((enrollment) => (
                    <EnrolledCourseCard
                      key={enrollment.id}
                      enrollment={enrollment}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border">
                <BookOpen className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2">Anda belum mendaftar di kursus manapun.</p>
              </div>
            )}
          </div>

          {/* Bagian Kredensial Dimiliki */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Kredensial Dimiliki
            </h2>
            {sbts.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                <AnimatePresence>
                  {sbts.map((sbt) => (
                    <SbtCard key={sbt.id} sbt={sbt} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border">
                Anda belum memiliki kredensial apapun.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
