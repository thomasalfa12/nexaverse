"use client";
import type { TemplateWithStats } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProviders";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { useEnroll } from "@/hooks/useEnroll";

const toGatewayURLPricing = (ipfsUri: string) => {
  if (ipfsUri && ipfsUri.startsWith("ipfs://"))
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  return ipfsUri;
};

export function PricingBox({
  course,
  isEnrolled,
  isCheckingEnrollment,
  onEnrollSuccess,
}: {
  course: TemplateWithStats;
  isEnrolled: boolean;
  isCheckingEnrollment: boolean;
  onEnrollSuccess: () => void;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const priceInEth = course.pricing?.price
    ? course.pricing.price.toString()
    : "0";
  const isFree = !course.pricing || Number(priceInEth) === 0;

  const { enroll, isPending, isConfirming, isConfirmed } = useEnroll(
    course.contractAddress as `0x${string}`,
    priceInEth
  );

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Pendaftaran On-Chain Berhasil!", {
        description: "Selamat datang! Anda akan diarahkan ke ruang belajar.",
      });
      onEnrollSuccess(); // Panggil refetch untuk memperbarui status isEnrolled
      setTimeout(() => {
        router.push(`/dashboard/courses/${course.id}/learn`);
      }, 2000);
    }
  }, [isConfirmed, onEnrollSuccess, router, course.id]);

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    enroll();
  };

  const isLoading = isPending || isConfirming || isCheckingEnrollment;
  const buttonText = isCheckingEnrollment
    ? "Memeriksa Akses..."
    : isPending
    ? "Buka Dompet Anda..."
    : isConfirming
    ? "Memproses Transaksi..."
    : isFree
    ? "Daftar Gratis Sekarang"
    : "Beli Kursus";

  return (
    <Card className="sticky top-24 shadow-lg">
      <CardContent className="p-4">
        <div className="aspect-[16/9] bg-muted rounded-md overflow-hidden relative mb-4">
          <Image
            src={toGatewayURLPricing(course.imageUrl)}
            alt={course.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">HARGA</p>
          <div className="text-4xl font-bold my-2">
            {isFree ? "Gratis" : `${priceInEth} ETH`}
          </div>
        </div>

        {/* FIX: Logika ini sekarang akan berfungsi dengan benar.
          - `isEnrolled` akan true jika hook `useOnchainEnrollment` menemukan token.
          - `isConfirmed` akan true SEGERA setelah transaksi Anda berhasil,
            mengubah tombol secara instan tanpa perlu refresh.
        */}
        {isEnrolled || isConfirmed ? (
          <Button
            onClick={() => router.push(`/dashboard/courses/${course.id}/learn`)}
            className="w-full h-12 text-lg mt-4"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Masuk ke Ruang Belajar
          </Button>
        ) : (
          <Button
            onClick={handleEnrollClick}
            disabled={isLoading}
            className="w-full h-12 text-lg mt-4"
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {buttonText}
          </Button>
        )}
        <p className="text-xs text-muted-foreground text-center mt-2">
          Akses seumur hidup via NFT
        </p>
      </CardContent>
    </Card>
  );
}
