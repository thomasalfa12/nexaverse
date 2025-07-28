"use client";
import type { TemplateWithStats } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CredentialManager({ course }: { course: TemplateWithStats }) {
  const hasCredentialContract = !!course.finalCredentialContract;

  const handleDeployCredential = () => {
    // Di sini akan memanggil server action `templateAction`
    // untuk men-deploy UserSBT dan menautkannya ke kursus ini.
    alert("Logika untuk men-deploy kontrak kredensial akan ada di sini.");
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
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {course.finalCredentialContract}
            </p>
            <div className="mt-4">
              {/* Di sini akan ada UI untuk mengelola daftar eligible
                  untuk kredensial kelulusan, terpisah dari pendaftaran kursus. */}
              <p>
                UI untuk mengelola daftar siswa yang lulus akan ada di sini.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Belum ada kontrak kredensial untuk kursus ini.
            </p>
            <Button className="mt-4" onClick={handleDeployCredential}>
              Siapkan & Deploy Kontrak Kredensial
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
