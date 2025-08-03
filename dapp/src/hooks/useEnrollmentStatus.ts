"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

/**
 * Hook kustom untuk memeriksa status pendaftaran (enrollment) seorang pengguna
 * pada sebuah kursus secara efisien melalui API.
 */
export function useEnrollmentStatus(courseId?: string) {
  const { status } = useSession();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkEnrollment = useCallback(async () => {
    // Jangan lakukan apa-apa jika courseId belum ada atau pengguna belum login
    if (!courseId || status !== "authenticated") {
      setIsEnrolled(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/me/enrollments/${courseId}`, {
        cache: 'no-cache' // Ensure fresh data
      });
      
      if (res.ok) {
        setIsEnrolled(true);
      } else if (res.status === 404) {
        setIsEnrolled(false);
      } else {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (error) {
      console.error("Failed to check enrollment status:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      setIsEnrolled(false);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, status]);

  useEffect(() => {
    checkEnrollment();
  }, [checkEnrollment]);

  // Listen for enrollment sync events
  useEffect(() => {
    const handleEnrollmentSync = (event: CustomEvent) => {
      if (event.detail.courseId === courseId) {
        // Refresh enrollment status after sync
        setTimeout(() => checkEnrollment(), 1000);
      }
    };

    window.addEventListener('enrollmentSynced', handleEnrollmentSync as EventListener);
    
    return () => {
      window.removeEventListener('enrollmentSynced', handleEnrollmentSync as EventListener);
    };
  }, [courseId, checkEnrollment]);

  return {
    isEnrolled,
    isLoading,
    error,
    refetch: checkEnrollment,
  };
}