"use client";

import { useState, useEffect } from "react";
import type { ClaimableRecord } from "@/types";

export function useClaims() {
  const [claims, setClaims] = useState<ClaimableRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchClaims = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/me/claims");
        if (!res.ok) throw new Error("Gagal memuat data klaim.");
        const data = await res.json();
        setClaims(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Terjadi kesalahan."));
      } finally {
        setIsLoading(false);
      }
    };
    fetchClaims();
  }, []);

  return {
    claims,
    isLoading,
    error,
    claimsCount: claims.length,
  };
}