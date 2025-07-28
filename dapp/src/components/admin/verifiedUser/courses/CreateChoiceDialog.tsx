"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookMarked, LayoutGrid } from "lucide-react";

interface CreateChoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: "course" | "simple") => void;
}

export function CreateChoiceDialog({
  isOpen,
  onClose,
  onSelectOption,
}: CreateChoiceDialogProps) {
  // ... (Implementasi tidak berubah, hanya lokasi file)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Apa yang ingin Anda buat?
          </DialogTitle>
          <DialogDescription>
            Pilih jenis kredensial yang paling sesuai dengan kebutuhan Anda.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <Card
            className="cursor-pointer hover:border-primary transition-all"
            onClick={() => onSelectOption("course")}
          >
            <CardHeader>
              <LayoutGrid className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Kursus Multi-Modul</CardTitle>
              <CardDescription>
                Bangun alur pembelajaran lengkap dengan video, teks, sesi live,
                dan tugas.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary transition-all"
            onClick={() => onSelectOption("simple")}
          >
            <CardHeader>
              <BookMarked className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Kredensial Sederhana</CardTitle>
              <CardDescription>
                Terbitkan kredensial tunggal dengan cepat. Sempurna untuk bukti
                kehadiran atau lencana.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
