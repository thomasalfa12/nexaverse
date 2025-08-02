// src/components/admin/verifiedUser/courses/details/CredentialManager.tsx (Sudah Diperbaiki)

"use client";
// FIX: Ganti tipe TemplateWithStats menjadi CourseWithStats
import type { CourseWithStats } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// FIX: Ganti tipe prop 'course'
export function CredentialManager({ course }: { course: CourseWithStats }) {
  // FIX: Logika diubah karena `finalCredentialContract` tidak ada lagi.
  // Untuk saat ini, kita anggap kredensial belum ada dan perlu dibuat.
  // Anda bisa mengembangkan logika ini nanti untuk mengecek relasi ke model Credential.
  const hasCredentialContract = false; // Placeholder

  const handleDeployCredential = () => {
    alert(
      `Logika untuk deploy kredensial bagi kursus "${course.title}" akan ada di sini.`
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Kredensial Kelulusan</CardTitle>
        <CardDescription>
          Atur sertifikat (SBT) yang akan diterima siswa setelah menyelesaikan
          kursus ini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasCredentialContract ? (
          <div>
            <p className="text-sm font-medium">
              Kontrak Kredensial sudah disiapkan.
            </p>
            {/* Logika untuk menampilkan alamat kontrak jika sudah ada */}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Belum ada kredensial kelulusan untuk kursus ini.
            </p>
            <Button className="mt-4" onClick={handleDeployCredential}>
              Siapkan & Deploy Kredensial
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
