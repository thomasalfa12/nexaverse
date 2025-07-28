"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { TemplateWithStats } from "@/types";
import { CourseHeader } from "@/components/course/CourseHeader";
import { CourseCurriculum } from "@/components/course/CourseCurriculum";
import { InstructorBio } from "@/components/course/InstructorBio";
import { PricingBox } from "@/components/course/PricingBox";
import { Loader2 } from "lucide-react";
import { useOnchainEnrollment } from "@/hooks/useOnchainEnrollment";

export default function CourseLandingPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<TemplateWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    isEnrolled,
    isLoading: isCheckingEnrollment,
    refetchEnrollment,
  } = useOnchainEnrollment(course?.contractAddress as `0x${string}`);

  useEffect(() => {
    if (!courseId) return;
    const fetchCourseData = async () => {
      setIsLoading(true);
      try {
        const courseRes = await fetch(`/api/courses/${courseId}`);
        if (!courseRes.ok) throw new Error("Kursus tidak ditemukan");
        setCourse(await courseRes.json());
      } catch (error) {
        console.error(error);
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  if (!course)
    return <div className="text-center py-20">Kursus tidak ditemukan.</div>;

  return (
    <div>
      <CourseHeader course={course} />
      <div className="container mx-auto py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
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
  );
}
