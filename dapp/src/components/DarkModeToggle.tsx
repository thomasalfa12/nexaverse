// src/components/DarkModeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Moon, Sun } from "lucide-react";

interface Props {
  className?: string;
}

export default function DarkModeToggle({ className }: Props) {
  /* 1️⃣ mulai selalu false (match SSR) */
  const [dark, setDark] = useState(false);
  /* 2️⃣ flag agar kita tahu sudah di‑mount */
  const [mounted, setMounted] = useState(false);

  /* 3️⃣ di client → sync dari localStorage & DOM */
  useEffect(() => {
    const saved = localStorage.getItem("nexa_dark") === "1";
    setDark(saved); // safe: hanya client
    setMounted(true); // hydration sudah selesai
  }, []);

  /* 4️⃣ apply & persist setiap kali dark berubah */
  useEffect(() => {
    if (!mounted) return; // hindari efek sebelum sync
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("nexa_dark", dark ? "1" : "0");
  }, [dark, mounted]);

  /* 5️⃣ jaga agar icon muncul setelah mount supaya tak mismatch */
  if (!mounted) {
    return (
      <button
        aria-label="Toggle dark mode"
        className={clsx(
          "rounded-full bg-gray-200 p-2 shadow dark:bg-zinc-700",
          className
        )}
      >
        {/* placeholder ikon statis (sesuai default SSR) */}
        <Moon className="h-4 w-4" />
      </button>
    );
  }

  /* 6️⃣ UI normal */
  return (
    <button
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle dark mode"
      className={clsx(
        "rounded-full bg-gray-200 p-2 shadow transition hover:bg-gray-300",
        "dark:bg-zinc-700 dark:hover:bg-zinc-600",
        className
      )}
    >
      {dark ? (
        <Sun className="h-4 w-4 text-yellow-400" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
