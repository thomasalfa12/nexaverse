// components/admin/verifiedUser/courses/details/PricingManager.tsx (Dioptimalkan)

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
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import type { Pricing } from "@/types";
import { useUpdateCourse } from "@/hooks/useUpdateCourse"; // Hook baru kita
import { isAddress } from "viem";

type PricingFormData = {
  price: string;
  paymentToken: string;
};

export function PricingManager({ courseId }: { courseId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const { isUpdating, updatePrice, updatePaymentToken } = useUpdateCourse();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PricingFormData>();

  // Di aplikasi nyata, Anda akan mengambil data on-chain atau dari DB
  useEffect(() => {
    // Placeholder untuk mengambil data harga & token saat ini
    // const fetchCurrentPricing = async () => { ... }
    // fetchCurrentPricing();
    setIsLoading(false);
  }, [courseId, setValue]);

  const handlePriceSubmit = async (data: PricingFormData) => {
    await updatePrice(courseId as `0x${string}`, data.price);
  };

  const handleTokenSubmit = async (data: PricingFormData) => {
    if (!isAddress(data.paymentToken)) {
      toast.error("Alamat token tidak valid.");
      return;
    }
    await updatePaymentToken(
      courseId as `0x${string}`,
      data.paymentToken as `0x${string}`
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign /> Pengaturan Harga & Pembayaran
        </CardTitle>
        <CardDescription>
          Kelola harga dan token pembayaran kursus Anda secara on-chain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Form untuk Update Harga */}
        <form onSubmit={handleSubmit(handlePriceSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="price">Ubah Harga (dalam ETH/Token)</Label>
            <Input
              id="price"
              type="number"
              step="0.001"
              placeholder="0.05"
              {...register("price", { required: "Harga wajib diisi" })}
            />
            {errors.price && (
              <p className="text-sm text-destructive mt-1">
                {errors.price.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Perbarui Harga
          </Button>
        </form>

        {/* Form untuk Update Token Pembayaran */}
        <form
          onSubmit={handleSubmit(handleTokenSubmit)}
          className="space-y-3 border-t pt-6"
        >
          <div>
            <Label htmlFor="paymentToken">Ubah Token Pembayaran</Label>
            <Input
              id="paymentToken"
              placeholder="0x... (isi 0x0...0 untuk ETH)"
              {...register("paymentToken", {
                required: "Alamat token wajib diisi",
              })}
            />
            {errors.paymentToken && (
              <p className="text-sm text-destructive mt-1">
                {errors.paymentToken.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Perbarui Token
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
