"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import type { CourseWithStats } from "@/types";
import { TemplateListView } from "@/components/admin/verifiedUser/template/CourseListView";
import { TemplateDetailView } from "@/components/admin/verifiedUser/template/CourseDetailView";
import { CreateCourseDialog } from "@/components/admin/verifiedUser/courses/CreateCourseDialog";
import { CreateChoiceDialog } from "@/components/admin/verifiedUser/template/TemplateChoiceDialog";
import { CreateCredentialDialog } from "@/components/admin/verifiedUser/credential/CreateCredentialDialog";
import { Button } from "@/components/ui/button";

export default function VerifiedUserDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [allTemplates, setAllTemplates] = useState<CourseWithStats[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<CourseWithStats | null>(null);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSimpleModalOpen, setIsSimpleModalOpen] = useState(false);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/community/template");
      if (!res.ok) throw new Error("Gagal memuat data.");
      setAllTemplates(await res.json());
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSelectCreationType = (option: "course" | "simple") => {
    setIsChoiceModalOpen(false);
    if (option === "course") setIsCourseModalOpen(true);
    else setIsSimpleModalOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCourseModalOpen(false);
    setIsSimpleModalOpen(false);
    toast.success("Aset berhasil dibuat!");
    fetchTemplates();
  };

  if (selectedTemplate) {
    return (
      <TemplateDetailView
        course={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <CreateChoiceDialog
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onSelectOption={handleSelectCreationType}
      />
      <CreateCourseDialog
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      <CreateCredentialDialog
        isOpen={isSimpleModalOpen}
        onClose={() => setIsSimpleModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Dasbor Kreator</h1>
          <p className="text-muted-foreground">
            Kelola semua kursus dan kredensial yang Anda terbitkan.
          </p>
        </div>
        <Button onClick={() => setIsChoiceModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Buat Baru
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        // FIX: Tidak ada lagi Tabs. Langsung tampilkan semua sebagai kursus.
        <TemplateListView
          courses={allTemplates}
          onSelectCourse={setSelectedTemplate}
          emptyStateMessage="Anda belum membuat kursus apapun. Klik 'Buat Baru' untuk memulai."
          onCreateClick={() => handleSelectCreationType("course")}
        />
      )}
    </div>
  );
}
