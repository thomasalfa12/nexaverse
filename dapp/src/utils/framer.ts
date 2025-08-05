"use client";

// Ini adalah pendekatan yang paling eksplisit.
// Kita impor satu per satu, lalu ekspor satu per satu.
// Tidak ada lagi `export *` yang bisa membingungkan Next.js.

import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useInView,
  LayoutGroup,
  // !!! PENTING: Jika Anda butuh fungsi lain dari framer-motion,
  // !!! tambahkan di sini. Contoh: Reorder, useAnimation, dll.
} from "framer-motion";

export {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useInView,
  LayoutGroup,
  // !!! Dan jangan lupa ekspor juga di sini.
};