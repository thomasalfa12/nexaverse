"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Impor semua bagian yang diperlukan dari file resizable-navbar Anda
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "@/components/ui/resizable-navbar";

// --- Komponen Utama Navbar ---
export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Definisikan item navigasi Anda di sini
  const navItems = [
    { name: "For Creators", link: "#creators" },
    { name: "Features", link: "#features" },
    { name: "Testimonials", link: "#testimonials" },
  ];

  return (
    // Gunakan komponen <Navbar> sebagai pembungkus utama
    <Navbar>
      {/* --- Tampilan Desktop --- */}
      {/* Gunakan <NavBody> untuk konten desktop */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="relative z-20 flex items-center gap-2">
          <Button asChild className="rounded-full px-5 font-semibold">
            <Link href="/login">Launch App</Link>
          </Button>
        </div>
      </NavBody>

      {/* --- Tampilan Mobile --- */}
      {/* Gunakan <MobileNav> untuk wrapper mobile */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        </MobileNavHeader>
        {/* Gunakan <MobileNavMenu> untuk menu dropdown */}
        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-lg font-medium text-neutral-600 dark:text-neutral-300 w-full"
            >
              {item.name}
            </a>
          ))}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full mt-4 border-t pt-4">
            <Button asChild className="w-full">
              <Link href="/login">Launch App</Link>
            </Button>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

// Logo Kustom untuk Nexaverse
const NavbarLogo = () => (
  <Link
    href="/"
    className="relative z-20 flex items-center gap-2 text-lg font-bold text-black dark:text-white"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
    </svg>
    <span className="font-bold">Nexaverse</span>
  </Link>
);
