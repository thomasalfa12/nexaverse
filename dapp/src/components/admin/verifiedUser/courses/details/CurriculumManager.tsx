"use client";
import { BookOpen, Loader2, PlusCircle, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import type { CourseModule } from "@/types";
import { toast } from "sonner";
import { ModuleFormDialog } from "../ModuleFormDialog"; // Impor dialog baru

export function CurriculumManager({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchModules = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules`);
      if (res.ok) setModules(await res.json());
      else throw new Error("Gagal memuat modul.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleDelete = async (moduleId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus modul ini?")) return;
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus modul.");
      toast.success("Modul berhasil dihapus.");
      fetchModules(); // Refresh daftar
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <>
      <ModuleFormDialog
        courseId={courseId}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false);
          fetchModules();
        }}
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen /> Manajemen Kurikulum
          </CardTitle>
          <CardDescription>
            Atur ulang, edit, atau tambahkan modul baru ke kursus Anda di sini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {modules.length > 0 ? (
                <ul className="space-y-2">
                  {modules.map((module) => (
                    <li
                      key={module.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-md"
                    >
                      <span className="font-medium">
                        {module.stepNumber}. {module.title}
                      </span>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(module.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-center text-muted-foreground py-8">
                  Belum ada modul di kurikulum ini.
                </p>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsFormOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Modul Baru
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
