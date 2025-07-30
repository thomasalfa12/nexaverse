"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, Loader2 } from "lucide-react";
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
import type { TemplateWithStats } from "@/types";
import { courseCategories } from "@/types/categoryCourse";
// BARU: Impor UploadButton dari file yang baru kita buat
import { UploadButton } from "@/lib/uploadthing";

const toGatewayURL = (ipfsUri: string) => {
  if (ipfsUri && ipfsUri.startsWith("ipfs://"))
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  return ipfsUri;
};

// Skema Zod sekarang juga bisa menerima imageUrl
const detailsSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter."),
  description: z.string().min(10, "Deskripsi minimal 10 karakter."),
  category: z.string().min(1, "Kategori wajib dipilih."),
  imageUrl: z.string().url("URL gambar tidak valid").optional(),
});

type DetailsFormData = z.infer<typeof detailsSchema>;

export function CourseCardManager({ course }: { course: TemplateWithStats }) {
  // State HANYA untuk URL gambar baru (visual), bukan file-nya
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue, // Kita butuh setValue untuk update form state secara programatik
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    // `defaultValues` sekarang juga menyertakan imageUrl
    defaultValues: {
      title: course.title,
      description: course.description,
      category: course.category || "",
      imageUrl: course.imageUrl,
    },
  });

  // Logika pengiriman sekarang SANGAT sederhana, hanya mengirim JSON
  const onSubmit = async (data: DetailsFormData) => {
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), // Kirim sebagai JSON, bukan FormData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menyimpan perubahan.");
      }
      toast.success("Detail kursus berhasil diperbarui.");
      setNewImageUrl(null); // Reset pratinjau
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
          {/* Bagian Judul, Deskripsi, dan Kategori tidak banyak berubah */}
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
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ..."
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

          {/* Editor Gambar Sampul sekarang menggunakan UploadThing */}
          <div className="space-y-3">
            <Label>Gambar Sampul</Label>
            <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center gap-4">
              {/* FIX 1: Bungkus <Image> dengan div yang memiliki 'relative' */}
              <div className="relative w-full max-w-lg aspect-video rounded-md overflow-hidden">
                <Image
                  src={newImageUrl || toGatewayURL(course.imageUrl)}
                  alt="Pratinjau Sampul"
                  fill
                  className="object-cover"
                />
              </div>
              {/* FIX 2: Sesuaikan tampilan UploadButton agar menyatu */}
              <UploadButton
                endpoint="courseImage"
                onClientUploadComplete={(res?: { url: string }[]) => {
                  if (res?.[0].url) {
                    toast.info(
                      "Gambar berhasil diunggah. Jangan lupa simpan perubahan."
                    );
                    setNewImageUrl(res[0].url);
                    setValue("imageUrl", res[0].url, { shouldDirty: true });
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error("Upload Gagal", { description: error.message });
                }}
                // Prop 'appearance' untuk styling
                appearance={{
                  button:
                    "ut-ready:bg-primary ut-uploading:bg-primary/50 w-full text-base py-6",
                  container: "w-full flex justify-center",
                  allowedContent: "text-muted-foreground",
                }}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
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
