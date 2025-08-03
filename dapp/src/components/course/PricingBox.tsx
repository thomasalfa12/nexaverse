"use client";
import type { CourseWithStats } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { useEnroll } from "@/hooks/useEnroll";
import type { Pricing } from "@prisma/client";

// FIX: Definisikan tipe lokal yang lebih spesifik untuk menyertakan paymentToken
type PricingWithToken = Pricing & { paymentToken?: string | null };

const toGatewayURL = (ipfsUri: string | null | undefined): string => {
  if (ipfsUri && ipfsUri.startsWith("ipfs://"))
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  return ipfsUri || "/images/placeholder.png";
};

export function PricingBox({
  course,
  isEnrolled,
  isCheckingEnrollment,
  onEnrollSuccess,
}: {
  course: CourseWithStats;
  isEnrolled: boolean;
  isCheckingEnrollment: boolean;
  onEnrollSuccess: () => void;
}) {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const priceInEth = course.pricing?.price
    ? course.pricing.price.toString()
    : "0";
  const isFree = !course.pricing || Number(priceInEth) === 0;

  // FIX: Hapus 'hash' yang tidak terpakai
  const { enroll, status: enrollStatus, isSuccess } = useEnroll();

  useEffect(() => {
    if (isSuccess) {
      onEnrollSuccess();
      setTimeout(() => {
        router.push(`/dashboard/courses/${course.id}/learn`);
      }, 2000);
    }
  }, [isSuccess, onEnrollSuccess, router, course.id]);

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      toast.info("Silakan login untuk mendaftar kursus.");
      router.push("/login");
      return;
    }

    if (!course.contractAddress) {
      toast.error("Error", {
        description: "Alamat kontrak kursus tidak ditemukan.",
      });
      return;
    }

    // FIX: Gunakan type assertion yang aman, bukan 'any'
    const paymentToken = (course.pricing as PricingWithToken)?.paymentToken;

    enroll({
      courseId: course.id,
      contractAddress: course.contractAddress as `0x${string}`,
      price: priceInEth,
      paymentToken: paymentToken ? (paymentToken as `0x${string}`) : undefined,
    });
  };

  const getButtonState = () => {
    if (isCheckingEnrollment)
      return { text: "Memeriksa Akses...", loading: true };
    if (enrollStatus === "checking")
      return { text: "Memverifikasi Status...", loading: true };
    if (enrollStatus === "enrolling")
      return { text: "Buka Dompet Anda...", loading: true };
    if (enrollStatus === "confirming")
      return { text: "Menunggu Konfirmasi...", loading: true };
    if (enrollStatus === "syncing")
      return { text: "Menyinkronkan Data...", loading: true };

    return {
      text: isFree ? "Daftar Gratis Sekarang" : "Beli Kursus",
      loading: false,
    };
  };

  const buttonState = getButtonState();
  const showEnrolledState = isEnrolled || isSuccess;

  // FIX: Gunakan type assertion yang aman di sini juga
  const pricingData = course.pricing as PricingWithToken | null;

  return (
    <Card className="sticky top-24 shadow-lg">
      <CardContent className="p-4">
        <div className="aspect-[16/9] bg-muted rounded-md overflow-hidden relative mb-4">
          <Image
            src={toGatewayURL(course.imageUrl)}
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
          {pricingData?.paymentToken &&
            pricingData.paymentToken !==
              "0x0000000000000000000000000000000000000000" && (
              <p className="text-xs text-muted-foreground">
                Pembayaran menggunakan Token
              </p>
            )}
        </div>

        {showEnrolledState ? (
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
            disabled={buttonState.loading}
            className="w-full h-12 text-lg mt-4"
          >
            {buttonState.loading && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            {buttonState.text}
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center mt-2">
          Akses seumur hidup via NFT
        </p>
      </CardContent>
    </Card>
  );
}
