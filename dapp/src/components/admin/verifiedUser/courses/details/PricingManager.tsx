"use client";
import { DollarSign, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import type { Pricing } from "@/types";

// FIX: Skema Zod diselaraskan dengan skema Prisma dan logika form.
const pricingSchema = z.object({
  type: z.enum(["FREE", "ONE_TIME", "SUBSCRIPTION"]),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif.").optional(),
});

type PricingFormData = z.infer<typeof pricingSchema>;

export function PricingManager({ courseId }: { courseId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { isSubmitting, errors },
  } = useForm<PricingFormData>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      type: "FREE",
      price: 0,
    },
  });
  const priceType = watch("type");

  useEffect(() => {
    const fetchPricing = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/courses/${courseId}/pricing`);
        if (res.ok) {
          const data: Pricing | null = await res.json();
          if (data) {
            setValue("type", data.type);
            setValue("price", Number(data.price));
          }
        }
      } catch {
        toast.error("Gagal memuat data harga.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPricing();
  }, [courseId, setValue]);

  const onSubmit = async (data: PricingFormData) => {
    const payload = {
      ...data,
      price: data.type === "FREE" ? 0 : data.price || 0,
    };

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/pricing`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal menyimpan harga.");
      toast.success("Pengaturan harga berhasil disimpan.");
    } catch (error) {
      toast.error("Gagal menyimpan", { description: (error as Error).message });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign /> Pengaturan Harga
        </CardTitle>
        <CardDescription>
          Atur model harga dan biaya untuk kursus Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Model Harga</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Gratis</SelectItem>
                    <SelectItem value="ONE_TIME">Sekali Bayar</SelectItem>
                    <SelectItem value="SUBSCRIPTION">Berlangganan</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {priceType !== "FREE" && (
            <div>
              <Label>Harga (USDC)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="25.00"
                {...register("price")}
              />
              {errors.price && (
                <p className="text-sm text-destructive mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Harga
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
