"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud, Image as ImageIcon } from "lucide-react";
import { createAssetAction } from "@/lib/server/actions/assetAction"; // Menggunakan action universal

export function CreateCourseForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createAssetAction(formData);
      if (result.success) {
        toast.success("Kursus berhasil dibuat sebagai draft!");
        formRef.current?.reset();
        setImagePreview(null);
        onSuccess?.();
      } else {
        toast.error("Gagal membuat kursus", { description: result.error });
      }
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-4 py-4">
      {/* FIX UTAMA: Menambahkan input tersembunyi untuk menandai tipe aset */}
      <input type="hidden" name="templateType" value="COURSE" />

      <div className="space-y-2">
        <Label htmlFor="title">Judul Kursus</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Contoh: Belajar Solidity dari Dasar"
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi Singkat</Label>
        <Textarea
          id="description"
          name="description"
          required
          placeholder="Jelaskan secara singkat tentang kursus ini..."
          disabled={isPending}
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Harga (dalam ETH)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.001"
          required
          placeholder="0.05"
          defaultValue="0"
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          Isi 0 untuk kursus gratis.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Gambar Sampul (Maks. 1MB)</Label>
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
          <div>
            <Input
              id="image"
              name="image"
              type="file"
              required
              accept="image/*"
              onChange={(e) =>
                e.target.files?.[0] &&
                setImagePreview(URL.createObjectURL(e.target.files[0]))
              }
              className="hidden"
              disabled={isPending}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image")?.click()}
              disabled={isPending}
            >
              <UploadCloud className="mr-2 h-4 w-4" /> Pilih Gambar
            </Button>
          </div>
        </div>
      </div>
      <div className="pt-4">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Men-deploy Kontrak..." : "Buat Kursus & Deploy Kontrak"}
        </Button>
      </div>
    </form>
  );
}
