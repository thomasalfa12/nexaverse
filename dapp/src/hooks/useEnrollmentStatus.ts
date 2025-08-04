"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

/**
 * Hook kustom yang "pintar" untuk memeriksa status pendaftaran (enrollment)
 * seorang pengguna pada sebuah kursus secara efisien melalui API.
 */
export function useEnrollmentStatus(courseId?: string) {
  const { status: sessionStatus } = useSession(); // Hanya butuh status sesi
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Mulai dengan loading true

  const checkEnrollment = useCallback(async () => {
    // --- LOGIKA CERDAS ---
    // 1. Jika sesi masih loading, kita juga loading.
    if (sessionStatus === "loading") {
      setIsLoading(true);
      return;
    }

    // 2. Jika pengguna TIDAK terotentikasi, kita sudah tahu jawabannya
    //    tanpa perlu memanggil API. Mereka pasti belum terdaftar.
    if (sessionStatus !== "authenticated" || !courseId) {
      setIsEnrolled(false);
      setIsLoading(false);
      return;
    }

    // 3. HANYA JIKA pengguna sudah login, baru kita panggil API privat.
    setIsLoading(true);
    try {
      const res = await fetch(`/api/me/enrollments/${courseId}`);
      // res.ok akan true jika status 200 (ditemukan), dan false jika 404 (tidak ditemukan)
      setIsEnrolled(res.ok); 
    } catch (error) {
      console.error("Failed to check enrollment status:", error);
      setIsEnrolled(false); // Asumsikan tidak terdaftar jika ada error jaringan
    } finally {
      setIsLoading(false);
    }
  }, [courseId, sessionStatus]);

  useEffect(() => {
    checkEnrollment();
  }, [checkEnrollment]);

  return {
    isEnrolled,
    isLoading,
    refetch: checkEnrollment, // Sediakan fungsi refetch untuk pembaruan manual
  };
}
