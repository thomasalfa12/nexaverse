// components/ui/shimmer-button.tsx
"use client";

import Link from "next/link";
import React from "react";

interface ShimmerButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
}

export function ShimmerButton({
  children,
  className,
  href = "/dashboard",
}: ShimmerButtonProps) {
  return (
    <Link
      href={href}
      // FIX: Mengganti theme() dengan variabel CSS langsung untuk menghindari warning
      className={`inline-flex h-12 animate-shimmer items-center justify-center rounded-full border border-primary/20 bg-[linear-gradient(110deg,hsl(var(--background)),45%,hsl(var(--primary)/0.1),55%,hsl(var(--background)))] bg-[length:200%_100%] px-8 font-bold text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background text-base gap-2 ${className}`}
    >
      {children}
    </Link>
  );
}
