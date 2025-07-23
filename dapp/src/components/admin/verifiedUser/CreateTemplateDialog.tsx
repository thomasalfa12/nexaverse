"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";

// Komponen UI & Ikon
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud, Image as ImageIcon, Wand2 } from "lucide-react";

// Impor Server Action baru kita
import { createTemplateAction } from "@/lib/server/actions/templateAction";

interface CreateTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTemplateDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateTemplateDialogProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        // 1MB
        toast.error("Ukuran gambar tidak boleh melebihi 1MB.");
        setImagePreview(null);
        setFileName("");
        event.target.value = "";
        return;
      }
      setFileName(file.name);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (
      !formData.get("title") ||
      !formData.get("symbol") ||
      !formData.get("description") ||
      !(formData.get("image") as File).size
    ) {
      toast.error("Semua field wajib diisi.");
      return; // FIX: Memastikan fungsi tidak mengembalikan nilai
    }

    startTransition(async () => {
      const result = await createTemplateAction(formData);

      if (result.success) {
        toast.success("Templat dan kontrak berhasil dibuat!");
        onSuccess();
      } else {
        toast.error(result.error || "Gagal membuat templat.");
      }
    });
  };

  const handleClose = () => {
    setImagePreview(null);
    setFileName("");
    formRef.current?.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            Buat Templat Kredensial Baru
          </DialogTitle>
          <DialogDescription>
            Isi detail di bawah ini. Sebuah smart contract UserSBT baru akan
            di-deploy secara otomatis untuk templat ini.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Kredensial</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Contoh: Sertifikat Webinar Solidity"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="symbol">Simbol Token (3-10 Karakter)</Label>
            <Input
              id="symbol"
              name="symbol"
              required
              placeholder="Contoh: NEXA-SOL"
              maxLength={10}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              required
              placeholder="Jelaskan apa arti kredensial ini..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Gambar Dasar (Maks. 1MB)</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Pratinjau"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="w-full">
                <Input
                  id="image"
                  name="image"
                  type="file"
                  required
                  accept="image/png, image/jpeg, image/gif, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {/* FIX: Memperbaiki sintaksis onClick yang salah */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image")?.click()}
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Pilih Gambar
                </Button>
                {fileName && (
                  <p className="text-xs text-muted-foreground mt-2 truncate">
                    {fileName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Batal
            </Button>
          </DialogClose>
          <Button
            onClick={() => formRef.current?.requestSubmit()}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Buat & Deploy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
