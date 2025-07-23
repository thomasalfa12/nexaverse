// File: app/dashboard/verifiedUser/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Impor tipe data yang diperluas dan komponen anak
import type { TemplateWithStats } from "@/components/admin/verifiedUser/TemplateListView";
import { TemplateListView } from "@/components/admin/verifiedUser/TemplateListView";
import { TemplateDetailView } from "@/components/admin/verifiedUser/TemplateDetailView";
import { CreateTemplateDialog } from "@/components/admin/verifiedUser/CreateTemplateDialog";

export default function VerifiedUserDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<TemplateWithStats[]>([]);

  // State KUNCI untuk mengontrol tampilan
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateWithStats | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fungsi untuk mengambil data dari API
  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/admin/community/template");
      if (!res.ok) throw new Error("Gagal memuat data templat.");
      const data = await res.json();
      setTemplates(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSelectTemplate = (template: TemplateWithStats) => {
    setSelectedTemplate(template);
  };

  const handleReturnToList = () => {
    setSelectedTemplate(null);
  };

  // Fungsi untuk menangani pembuatan templat baru yang sukses
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    toast.success("Templat berhasil dibuat!");
    // Muat ulang data untuk menampilkan templat baru
    fetchTemplates();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CreateTemplateDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Gunakan AnimatePresence untuk transisi yang mulus */}
      {selectedTemplate ? (
        <TemplateDetailView
          template={selectedTemplate}
          onBack={handleReturnToList}
        />
      ) : (
        <TemplateListView
          templates={templates}
          onSelectTemplate={handleSelectTemplate}
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
      )}
    </div>
  );
}
