"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateCourseForm } from "./CreateCourseForm";

export function CreateCourseDialog({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Buat Kursus Multi-Modul
          </DialogTitle>
          <DialogDescription>
            Rancang alur pembelajaran lengkap dengan video, teks, sesi live, dan
            tugas.
          </DialogDescription>
        </DialogHeader>
        {/* FIX: Wrapper div untuk membuat area konten bisa di-scroll */}
        <div className="overflow-y-auto pr-6 -mr-6 flex-grow">
          <CreateCourseForm onSuccess={onSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
