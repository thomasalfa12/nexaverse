"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Inbox } from "lucide-react";
import { ClaimCard } from "@/components/profile/ClaimCard";
import type { ClaimableRecord } from "@/types"; // Pastikan tipe ini didefinisikan dengan benar

export default function MyClaimsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [claimable, setClaimable] = useState<ClaimableRecord[]>([]);

  useEffect(() => {
    const fetchClaims = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/me/claims");
        if (!res.ok) throw new Error("Gagal memuat daftar klaim.");
        setClaimable(await res.json());
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClaims();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Kredensial untuk Diklaim
        </h1>
        <p className="mt-2 text-muted-foreground">
          Daftar kredensial dan lencana yang telah Anda peroleh dan siap untuk
          diklaim.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : claimable.length > 0 ? (
        <div className="space-y-4 max-w-4xl mx-auto">
          {claimable.map((record) => (
            <ClaimCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 border-2 border-dashed rounded-xl max-w-4xl mx-auto">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            Kotak Klaim Anda Kosong
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Saat Anda berhak atas kredensial, kredensial itu akan muncul di
            sini.
          </p>
        </div>
      )}
    </div>
  );
}
