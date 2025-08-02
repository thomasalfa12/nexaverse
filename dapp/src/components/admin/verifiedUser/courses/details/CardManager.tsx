"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FileText, Loader2, UploadCloud } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { CourseWithStats } from "@/types";
import { courseCategories } from "@/types/categoryCourse";
import { uploadCourseImageAction } from "@/lib/server/actions/imageActions";

// FIX 1: Buat fungsi ini lebih kuat untuk menangani nilai null/undefined
const toGatewayURL = (ipfsUri: string | null | undefined): string => {
  if (ipfsUri && ipfsUri.startsWith("ipfs://")) {
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  // Sediakan URL placeholder default jika tidak ada gambar sama sekali
  return ipfsUri || "/images/placeholder.png";
};

const detailsSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter."),
  description: z.string().min(10, "Deskripsi minimal 10 karakter."),
  category: z.string().min(1, "Kategori wajib dipilih."),
  imageUrl: z.string().url("URL gambar tidak valid").optional(),
});

type DetailsFormData = z.infer<typeof detailsSchema>;

export function CourseCardManager({ course }: { course: CourseWithStats }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // State ini sekarang akan menyimpan URL IPFS mentah, bukan URL gateway
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      title: course.title,
      description: course.description,
      category: course.category || "",
      imageUrl: course.imageUrl,
    },
  });

  const handleImageUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("Ukuran file terlalu besar (maksimal 5MB).");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Mengunggah gambar ke IPFS...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadCourseImageAction(formData);

      if (!result.success || !result.url) {
        throw new Error(result.error || "Gagal mengunggah file.");
      }

      toast.success("Gambar berhasil diunggah! Jangan lupa simpan perubahan.", {
        id: toastId,
      });
      // Simpan URL IPFS mentah ke state
      setNewImageUrl(result.url);
      setValue("imageUrl", result.url, { shouldDirty: true });
    } catch (error) {
      toast.error("Upload Gagal", {
        id: toastId,
        description: (error as Error).message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: DetailsFormData) => {
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menyimpan perubahan.");
      }
      toast.success("Detail kursus berhasil diperbarui.");
    } catch (error) {
      toast.error("Gagal menyimpan", { description: (error as Error).message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText /> Editor Detail Kursus
        </CardTitle>
        <CardDescription>
          Perubahan akan disimpan untuk kartu dan halaman publik kursus Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="title">Judul Kursus</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" {...register("description")} rows={5} />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="category">Kategori</Label>
            <select
              id="category"
              {...register("category")}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Pilih Kategori</option>
              {courseCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-destructive mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Gambar Sampul</Label>
            <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center gap-4">
              <div className="relative w-full max-w-lg aspect-video rounded-md overflow-hidden bg-muted">
                {/* FIX 2: Bungkus SEMUA kemungkinan URL dengan toGatewayURL */}
                <Image
                  src={toGatewayURL(newImageUrl || course.imageUrl)}
                  alt="Pratinjau Sampul"
                  fill
                  className="object-cover"
                />
              </div>
              <Input
                id="image-upload"
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                }}
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full max-w-lg"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-4 w-4" />
                )}
                {isUploading ? "Mengunggah..." : "Ganti Gambar Sampul"}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isUploading || isSubmitting || !isDirty}
            className="w-full"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
