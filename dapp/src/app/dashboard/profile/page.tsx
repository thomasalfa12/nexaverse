"use client";

import React, { useState, useEffect } from "react";
// Pastikan Anda telah menginstal dependensi ini:
// npm install @heroicons/react framer-motion
import { CheckBadgeIcon, PencilIcon } from "@heroicons/react/24/solid";
import { Twitter, Instagram, Linkedin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Tipe Data (Berdasarkan Arsitektur yang Kita Rancang) ---
type UserProfile = {
  walletAddress: string;
  name: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  socials: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  isVerifiedInstitution: boolean;
};

type CuratedSbt = {
  id: string;
  title: string;
  issuer: {
    name: string;
    logoUrl: string;
  };
  imageUrl: string;
  category: "Pendidikan" | "Sertifikasi" | "Penghargaan" | "Event";
  issuedDate: string;
};

// --- Mock Data (Untuk Simulasi Tampilan) ---
const MOCK_USER_PROFILE: UserProfile = {
  walletAddress: "0x1797bECa0a380ed51aBA90e2DAa04629839297c8",
  name: "Nexaverse Foundation",
  bio: "Membangun masa depan reputasi digital yang terdesentralisasi dan terpercaya. Satu SBT dalam satu waktu.",
  avatarUrl: "https://placehold.co/128x128/3b82f6/ffffff?text=NF",
  coverUrl: "https://placehold.co/1200x400/e0f2fe/3b82f6?text=+",
  socials: {
    twitter: "https://twitter.com/nexaverse",
    linkedin: "https://linkedin.com/company/nexaverse",
  },
  isVerifiedInstitution: true,
};

const MOCK_CURATED_SBTS: CuratedSbt[] = [
  {
    id: "1",
    title: "Sertifikat Kelulusan Blockchain Developer",
    issuer: {
      name: "Universitas Nexa",
      logoUrl: "https://placehold.co/40x40/f97316/ffffff?text=UN",
    },
    imageUrl: "https://placehold.co/600x600/f97316/ffffff?text=Sertifikat",
    category: "Pendidikan",
    issuedDate: "20 Jul 2025",
  },
  {
    id: "2",
    title: "Advanced Solidity Professional",
    issuer: {
      name: "Koding Keras Academy",
      logoUrl: "https://placehold.co/40x40/10b981/ffffff?text=KK",
    },
    imageUrl: "https://placehold.co/600x600/10b981/ffffff?text=Sertifikat",
    category: "Sertifikasi",
    issuedDate: "15 Mei 2025",
  },
  {
    id: "3",
    title: "Juara 1 Hackathon Web3 Nasional",
    issuer: {
      name: "Pemerintah Digital",
      logoUrl: "https://placehold.co/40x40/ef4444/ffffff?text=PD",
    },
    imageUrl: "https://placehold.co/600x600/ef4444/ffffff?text=Penghargaan",
    category: "Penghargaan",
    issuedDate: "01 Apr 2025",
  },
  {
    id: "4",
    title: "Tiket VIP Konferensi Nexaverse 2025",
    issuer: {
      name: "Nexaverse Events",
      logoUrl: "https://placehold.co/40x40/8b5cf6/ffffff?text=NE",
    },
    imageUrl: "https://placehold.co/600x600/8b5cf6/ffffff?text=Event",
    category: "Event",
    issuedDate: "10 Mar 2025",
  },
];

// --- Komponen-Komponen Kecil ---

const SocialLink: React.FC<{ href?: string; icon: React.ElementType }> = ({
  href,
  icon: Icon,
}) => {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-blue-500 transition-colors"
    >
      <Icon className="h-6 w-6" />
    </a>
  );
};

const SbtCard: React.FC<{ sbt: CuratedSbt }> = ({ sbt }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
  >
    <div className="aspect-square bg-gray-100">
      <img
        src={sbt.imageUrl}
        alt={sbt.title}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="p-5">
      <h3 className="font-bold text-gray-800 text-lg truncate">{sbt.title}</h3>
      <div className="flex items-center mt-2">
        <img
          src={sbt.issuer.logoUrl}
          alt={sbt.issuer.name}
          className="w-6 h-6 rounded-full mr-2"
        />
        <span className="text-sm text-gray-500">{sbt.issuer.name}</span>
      </div>
      <p className="text-xs text-gray-400 mt-3">{sbt.issuedDate}</p>
    </div>
  </motion.div>
);

const ProfileHeader: React.FC<{ profile: UserProfile }> = ({ profile }) => (
  <header className="relative">
    <div className="h-48 md:h-64 bg-gray-200 rounded-b-2xl overflow-hidden">
      <img
        src={profile.coverUrl}
        alt="Cover"
        className="w-full h-full object-cover"
      />
    </div>
    <div className="absolute top-32 md:top-40 left-1/2 -translate-x-1/2 w-full px-4">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white border-4 border-white shadow-lg -mt-16 md:-mt-20 overflow-hidden">
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
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
            <PencilIcon className="w-4 h-4" />
            Edit Profil
          </button>
        </div>
      </div>
    </div>
  </header>
);

// --- Komponen Utama Halaman Profil ---

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sbts, setSbts] = useState<CuratedSbt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Semua");

  useEffect(() => {
    setTimeout(() => {
      setProfile(MOCK_USER_PROFILE);
      setSbts(MOCK_CURATED_SBTS);
      setLoading(false);
    }, 1500);
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
      <div className="p-8 text-center text-gray-500">Gagal memuat profil.</div>
    );
  }

  const sbtCategories = [
    "Semua",
    ...Array.from(new Set(sbts.map((s) => s.category))),
  ];
  const filteredSbts =
    activeTab === "Semua" ? sbts : sbts.filter((s) => s.category === activeTab);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        <ProfileHeader profile={profile} />

        <main className="pt-40 md:pt-32 p-4 md:px-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <p className="text-gray-700">{profile.bio}</p>
            <div className="flex items-center gap-4 mt-4">
              <SocialLink href={profile.socials.twitter} icon={Twitter} />
              <SocialLink href={profile.socials.instagram} icon={Instagram} />
              <SocialLink href={profile.socials.linkedin} icon={Linkedin} />
            </div>
          </div>

          <div className="mt-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {sbtCategories.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`${
                      activeTab === tab
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            <motion.div
              layout
              className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {filteredSbts.map((sbt) => (
                  <SbtCard key={sbt.id} sbt={sbt} />
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredSbts.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                Tidak ada item untuk ditampilkan di kategori ini.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
