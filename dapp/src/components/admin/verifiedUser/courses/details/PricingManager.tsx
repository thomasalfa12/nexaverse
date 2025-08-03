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
import { useEffect, useState, useCallback } from "react";
import type { CourseWithStats } from "@/types";
import { useUpdateCourse } from "@/hooks/useUpdateCourse";
import { isAddress } from "viem";
import type { Pricing } from "@prisma/client";

// FIX: Definisikan tipe lokal yang lebih spesifik untuk menyertakan paymentToken
// Ini adalah cara yang aman untuk memberitahu TypeScript tentang properti tambahan.
type PricingWithToken = Pricing & { paymentToken?: string | null };

type PricingFormData = {
  price: string;
  paymentToken: string;
};

// Komponen ini sekarang membutuhkan seluruh objek 'course' untuk mendapatkan contractAddress
export function PricingManager({ course }: { course: CourseWithStats }) {
  const [isFetching, setIsFetching] = useState(true);
  const { isUpdating, updatePrice, updatePaymentToken } = useUpdateCourse();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PricingFormData>();

  // Fungsi untuk mengambil data harga dari DB dan mengisi form
  const fetchAndSetPricing = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/pricing`);
      if (res.ok) {
        const data: PricingWithToken = await res.json();
        setValue("price", data.price.toString() || "0");
        // FIX: Gunakan tipe yang sudah didefinisikan, tidak perlu 'any'
        setValue(
          "paymentToken",
          data.paymentToken || "0x0000000000000000000000000000000000000000"
        );
      }
    } catch (error) {
      console.error("Gagal mengambil data harga:", error);
      setValue("price", "0");
      setValue("paymentToken", "0x0000000000000000000000000000000000000000");
    } finally {
      setIsFetching(false);
    }
  }, [course.id, setValue]);

  useEffect(() => {
    fetchAndSetPricing();
  }, [fetchAndSetPricing]);

  const handlePriceSubmit = async (data: PricingFormData) => {
    // Tampilkan notifikasi loading
    const promise = () =>
      new Promise<void>(async (resolve, reject) => {
        try {
          await updatePrice(
            course.contractAddress as `0x${string}`,
            data.price
          );

          const res = await fetch(`/api/admin/courses/${course.id}/pricing`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              price: data.price,
              type: Number(data.price) > 0 ? "ONE_TIME" : "FREE",
            }),
          });

          if (!res.ok) throw new Error("Gagal menyimpan harga ke database.");

          resolve();
        } catch (error) {
          reject(error);
        }
      });

    toast.promise(promise, {
      loading: "Memperbarui harga on-chain...",
      success: "Harga berhasil diperbarui!",
      error: (err) => `Gagal: ${err.message}`,
    });
  };

  const handleTokenSubmit = async (data: PricingFormData) => {
    if (!isAddress(data.paymentToken)) {
      toast.error("Alamat token tidak valid.");
      return;
    }

    const promise = () =>
      new Promise<void>(async (resolve, reject) => {
        try {
          await updatePaymentToken(
            course.contractAddress as `0x${string}`,
            data.paymentToken as `0x${string}`
          );

          const res = await fetch(`/api/admin/courses/${course.id}/pricing`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentToken: data.paymentToken }),
          });

          if (!res.ok) throw new Error("Gagal menyimpan token ke database.");

          resolve();
        } catch (error) {
          reject(error);
        }
      });

    toast.promise(promise, {
      loading: "Memperbarui token on-chain...",
      success: "Token pembayaran berhasil diubah!",
      error: (err) => `Gagal: ${err.message}`,
    });
  };

  if (isFetching) {
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
          Kelola harga dan token pembayaran kursus Anda. Perubahan akan tercatat
          on-chain dan di database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
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
            Perbarui Harga On-Chain
          </Button>
        </form>

        <form
          onSubmit={handleSubmit(handleTokenSubmit)}
          className="space-y-3 border-t pt-6"
        >
          <div>
            <Label htmlFor="paymentToken">Ubah Token Pembayaran</Label>
            <Input
              id="paymentToken"
              placeholder="0x... (isi alamat 0 untuk ETH)"
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
            Perbarui Token On-Chain
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
