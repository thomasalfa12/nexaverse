"use client";
import { Settings, Eye, Archive, ShieldAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CourseWithStats } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import type { CourseStatus } from "@prisma/client";

export function CourseSettings({ course }: { course: CourseWithStats }) {
  // FIX: Menggunakan tipe CourseStatus yang diimpor
  const [currentStatus, setCurrentStatus] = useState<CourseStatus>(
    course.status
  );

  const handleStatusChange = async (newStatus: CourseStatus) => {
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`Gagal mengubah status ke ${newStatus}`);
      setCurrentStatus(newStatus);
      toast.success(`Status kursus berhasil diubah menjadi ${newStatus}.`);
    } catch (error) {
      toast.error("Gagal mengubah status", {
        description: (error as Error).message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings /> Pengaturan Kursus
        </CardTitle>
        <CardDescription>
          Kelola status publikasi dan opsi lanjutan lainnya.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Status Kursus</h4>
          <div className="flex items-center gap-4">
            {/* FIX: Mengganti <p> menjadi <div> untuk mencegah hydration error. */}
            <div className="flex items-center gap-2">
              <span>Saat ini:</span>
              <Badge>{currentStatus}</Badge>
            </div>
            {currentStatus === "DRAFT" && (
              <Button onClick={() => handleStatusChange("PUBLISHED")}>
                <Eye className="mr-2 h-4 w-4" /> Publikasikan
              </Button>
            )}
            {currentStatus === "PUBLISHED" && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange("DRAFT")}
              >
                Kembalikan ke Draft
              </Button>
            )}
          </div>
        </div>
        <div className="border-t pt-6">
          <h4 className="font-medium text-destructive mb-2 flex items-center gap-2">
            <ShieldAlert /> Zona Berbahaya
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Tindakan ini tidak dapat diurungkan dengan mudah.
          </p>
          <Button
            variant="destructive"
            onClick={() => handleStatusChange("ARCHIVED")}
          >
            <Archive className="mr-2 h-4 w-4" /> Arsipkan Kursus Ini
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
