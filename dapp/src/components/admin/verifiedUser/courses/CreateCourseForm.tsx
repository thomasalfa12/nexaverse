"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud, Image as ImageIcon } from "lucide-react";
import { useCreateCourse } from "@/hooks/useCreateCourse"; // Menggunakan hook baru
import { courseCategories } from "@/types/categoryCourse";

export function CreateCourseForm({ onSuccess }: { onSuccess?: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSuccess = () => {
    formRef.current?.reset();
    setImagePreview(null);
    if (onSuccess) {
      onSuccess();
    }
  };

  const { createCourse, isLoading } = useCreateCourse({
    onSuccess: handleSuccess,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as File;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    if (!title || !description || !image || image.size === 0) {
      toast.error("Semua field wajib diisi.");
      return;
    }

    await createCourse({ title, description, image, price, category });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Judul Kursus</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Contoh: Belajar Solidity dari Dasar"
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi Singkat</Label>
        <Textarea
          id="description"
          name="description"
          required
          placeholder="Jelaskan secara singkat tentang kursus ini..."
          disabled={isLoading}
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Kategori Kursus</Label>
        <select
          id="category"
          name="category"
          required
          disabled={isLoading}
          defaultValue=""
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="" disabled>
            Pilih sebuah kategori
          </option>
          {courseCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
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
          disabled={isLoading}
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
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image")?.click()}
              disabled={isLoading}
            >
              <UploadCloud className="mr-2 h-4 w-4" /> Pilih Gambar
            </Button>
          </div>
        </div>
      </div>
      <div className="pt-4">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Men-deploy Kontrak..." : "Buat Kursus & Deploy Kontrak"}
        </Button>
      </div>
    </form>
  );
}
