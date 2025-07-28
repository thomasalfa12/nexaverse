"use client";
import { FileText, Loader2 } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { TemplateWithStats } from "@/types";

const detailsSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter."),
  description: z.string().min(10, "Deskripsi minimal 10 karakter."),
  category: z.string().optional(),
  promoVideoUrl: z
    .string()
    .url("URL video tidak valid")
    .or(z.literal(""))
    .optional(),
});

type DetailsFormData = z.infer<typeof detailsSchema>;

export function LandingPageEditor({ course }: { course: TemplateWithStats }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      title: course.title,
      description: course.description,
      category: course.category || "",
      promoVideoUrl: course.promoVideoUrl || "",
    },
  });

  const onSubmit = async (data: DetailsFormData) => {
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal menyimpan perubahan.");
      toast.success("Detail kursus berhasil diperbarui.");
    } catch (error) {
      toast.error("Gagal menyimpan", { description: (error as Error).message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText /> Editor Halaman Arahan
        </CardTitle>
        <CardDescription>
          Ubah detail yang tampil di halaman publik kursus Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <Input
              id="category"
              {...register("category")}
              placeholder="Contoh: Web3 Development"
            />
          </div>
          <div>
            <Label htmlFor="promoVideoUrl">
              URL Video Promo (YouTube, Vimeo)
            </Label>
            <Input
              id="promoVideoUrl"
              {...register("promoVideoUrl")}
              placeholder="https://..."
            />
            {errors.promoVideoUrl && (
              <p className="text-sm text-destructive mt-1">
                {errors.promoVideoUrl.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
