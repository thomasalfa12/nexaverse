// File: app/dashboard/(main)/profile/_components/EnrolledCourseCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { resolveIpfsUrl } from "@/utils/pinata";
import type { EnrollmentWithCourse } from "../page";

export const EnrolledCourseCard = ({
  enrollment,
}: {
  enrollment: EnrollmentWithCourse;
}) => {
  const totalModules = enrollment.course._count.modules;
  const progressPercentage =
    totalModules > 0 ? (enrollment.progress / totalModules) * 100 : 0;

  return (
    // FIX: Menggunakan warna dari tema
    <Card className="h-full flex flex-col group overflow-hidden bg-card border transition-shadow hover:shadow-md">
      <CardHeader className="p-0">
        <div className="aspect-video bg-muted relative">
          <Image
            src={resolveIpfsUrl(enrollment.course.imageUrl)}
            alt={enrollment.course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-xs text-muted-foreground mb-1">
          oleh {enrollment.course.creator.name}
        </p>
        <CardTitle className="text-base font-semibold leading-tight flex-grow text-foreground">
          {enrollment.course.title}
        </CardTitle>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-start">
        <div className="w-full space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-muted-foreground">Progres</p>
            <p className="text-xs font-semibold text-primary">
              {Math.round(progressPercentage)}%
            </p>
          </div>
          <Progress value={progressPercentage} className="h-2 w-full" />
        </div>
        <Button asChild variant="secondary" className="w-full">
          <Link href={`/dashboard/courses/${enrollment.course.id}/learn`}>
            Lanjutkan Belajar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
