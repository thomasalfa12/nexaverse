// src/components/admin/verifiedUser/template/TemplateDetailView.tsx (Sudah Diperbaiki)

"use client";

// FIX: Impor tipe yang benar
import type { CourseWithStats } from "@/types";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  Users,
  FileText,
  DollarSign,
  Settings,
  Award,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurriculumManager } from "@/components/admin/verifiedUser/courses/details/CurriculumManager";
import { StudentManager } from "@/components/admin/verifiedUser/courses/details/StudentManager";
import { CourseCardManager } from "@/components/admin/verifiedUser/courses/details/CardManager";
import { PricingManager } from "@/components/admin/verifiedUser/courses/details/PricingManager";
import { CourseSettings } from "@/components/admin/verifiedUser/courses/details/CourseSettings";
import { CredentialManager } from "@/components/admin/verifiedUser/courses/details/CredentialManager";

export function TemplateDetailView({
  course, // FIX: Ganti 'template' menjadi 'course'
  onBack,
}: {
  course: CourseWithStats; // FIX: Gunakan tipe baru
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="-ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Dasbor
      </Button>
      <div className="space-y-1">
        {/* FIX: Akses properti dari 'course' */}
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="text-muted-foreground">Kelola semua aspek kursus Anda.</p>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="students">
            <Users className="mr-2 h-4 w-4" />
            Siswa
          </TabsTrigger>
          <TabsTrigger value="curriculum">
            <BookOpen className="mr-2 h-4 w-4" />
            Kurikulum
          </TabsTrigger>
          <TabsTrigger value="landing-page">
            <FileText className="mr-2 h-4 w-4" />
            Halaman
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="mr-2 h-4 w-4" />
            Harga
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Pengaturan
          </TabsTrigger>
          <TabsTrigger value="credential">
            <Award className="mr-2 h-4 w-4" />
            Kredensial
          </TabsTrigger>
        </TabsList>
        <TabsContent value="students" className="mt-4">
          {/* FIX: Kirim 'course.id' sebagai prop */}
          <StudentManager courseId={course.id} />
        </TabsContent>
        <TabsContent value="curriculum" className="mt-4">
          <CurriculumManager courseId={course.id} />
        </TabsContent>
        <TabsContent value="landing-page" className="mt-4">
          <CourseCardManager course={course} />
        </TabsContent>
        <TabsContent value="pricing" className="mt-4">
          <PricingManager courseId={course.id} />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <CourseSettings course={course} />
        </TabsContent>
        <TabsContent value="credential" className="mt-4">
          <CredentialManager course={course} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
