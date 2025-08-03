"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { CourseWithStats } from "@/types";
import { CourseHeader } from "@/components/course/CourseHeader";
import { CourseCurriculum } from "@/components/course/CourseCurriculum";
import { InstructorBio } from "@/components/course/InstructorBio";
import { PricingBox } from "@/components/course/PricingBox";
import { Loader2, ChevronLeft, AlertTriangle } from "lucide-react";
import { useEnrollmentStatus } from "@/hooks/useEnrollmentStatus";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CourseLandingPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    isEnrolled,
    isLoading: isCheckingEnrollment,
    refetch: refetchEnrollment,
  } = useEnrollmentStatus(courseId);

  useEffect(() => {
    if (!courseId) {
      setError("ID kursus tidak valid");
      setIsLoading(false);
      return;
    }

    const fetchCourseData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("[DEBUG] Fetching course with ID:", courseId);

        const courseRes = await fetch(`/api/courses/${courseId}`);

        console.log("[DEBUG] Response status:", courseRes.status);
        console.log(
          "[DEBUG] Response headers:",
          Object.fromEntries(courseRes.headers.entries())
        );

        if (!courseRes.ok) {
          const errorData = await courseRes
            .json()
            .catch(() => ({ error: "Unknown error" }));
          console.error("[DEBUG] Error response:", errorData);
          throw new Error(
            errorData.error ||
              `HTTP ${courseRes.status}: ${courseRes.statusText}`
          );
        }

        const courseData = await courseRes.json();
        console.log("[DEBUG] Course data received:", courseData);

        setCourse(courseData);
      } catch (error) {
        console.error("[DEBUG] Fetch error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan tidak dikenal"
        );
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat kursus...</p>
          <p className="text-sm text-muted-foreground mt-2">ID: {courseId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-20">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="mt-2">
            <strong>Error:</strong> {error}
            <br />
            <span className="text-sm">Course ID: {courseId}</span>
          </AlertDescription>
        </Alert>

        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Link>
          </Button>

          <Button
            variant="ghost"
            onClick={() => window.location.reload()}
            className="ml-4"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Kursus Tidak Ditemukan</h2>
        <p className="text-muted-foreground mt-2">
          Kursus yang Anda cari mungkin tidak ada atau telah dihapus.
        </p>
        <p className="text-sm text-muted-foreground mt-1">ID: {courseId}</p>
        <Button variant="outline" asChild className="mt-6">
          <Link href="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Kembali ke Discovery
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <CourseHeader course={course} />
      <div className="container mx-auto py-12">
        <Button variant="ghost" asChild className="mb-8 -ml-4">
          <Link href="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Kembali ke Semua Kursus
          </Link>
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-12">
            <CourseCurriculum modules={course.modules || []} />
            <InstructorBio creator={course.creator} />
          </div>
          <div className="lg:col-span-1">
            <PricingBox
              course={course}
              isEnrolled={isEnrolled}
              isCheckingEnrollment={isCheckingEnrollment}
              onEnrollSuccess={refetchEnrollment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
