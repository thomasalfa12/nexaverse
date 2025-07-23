// File: app/dashboard/verifiedUser/_components/TemplateDetailView.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import type { TemplateWithStats } from "./TemplateListView";
import type { EligibilityRecord } from "@prisma/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Users, Loader2, Upload } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// Impor Server Actions kita
import {
  addEligibleAddresses,
  getEligibilityList,
} from "@/lib/server/actions/eligibilityAction";

interface TemplateDetailViewProps {
  template: TemplateWithStats;
  onBack: () => void;
}

const toGatewayURL = (ipfsUri: string) => {
  if (ipfsUri && ipfsUri.startsWith("ipfs://")) {
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return ipfsUri;
};

export function TemplateDetailView({
  template,
  onBack,
}: TemplateDetailViewProps) {
  const [isPending, startTransition] = useTransition();
  const [addresses, setAddresses] = useState("");
  const [eligibilityList, setEligibilityList] = useState<EligibilityRecord[]>(
    []
  );
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Fungsi untuk mengambil daftar yang sudah ada
  const fetchList = async () => {
    setIsLoadingList(true);
    const list = await getEligibilityList(template.id);
    setEligibilityList(list);
    setIsLoadingList(false);
  };

  useEffect(() => {
    fetchList();
  }, [template.id]);

  const handleSubmit = () => {
    const addressList = addresses
      .split("\n")
      .filter((addr) => addr.trim() !== "");
    if (addressList.length === 0) {
      return toast.warning("Silakan masukkan setidaknya satu alamat wallet.");
    }

    startTransition(async () => {
      const result = await addEligibleAddresses(template.id, addressList);
      if (result.success) {
        toast.success(
          `${result.addedCount} alamat berhasil ditambahkan ke daftar kelayakan.`
        );
        setAddresses(""); // Kosongkan textarea
        fetchList(); // Muat ulang daftar
      } else {
        toast.error(result.error || "Gagal menambahkan alamat.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman Detail */}
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Semua Templat
        </Button>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
            <Image
              src={toGatewayURL(template.imageUrl)}
              alt={template.title}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {template.title}
            </h1>
            <p className="text-muted-foreground max-w-xl">
              {template.description}
            </p>
          </div>
        </div>
      </div>

      {/* Manajemen Kelayakan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Tambah Alamat Eligible</h2>
          <p className="text-sm text-muted-foreground">
            Tempelkan daftar alamat wallet di bawah ini (satu alamat per baris).
            Alamat yang sudah ada akan diabaikan.
          </p>
          <Textarea
            value={addresses}
            onChange={(e) => setAddresses(e.target.value)}
            placeholder="0x123..."
            rows={10}
            className="font-mono text-xs"
          />
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Tambahkan ke Daftar
          </Button>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold">
            Daftar Eligible Saat Ini ({eligibilityList.length})
          </h2>
          <div className="mt-4 border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alamat Wallet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Ditambahkan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingList ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : eligibilityList.length > 0 ? (
                  eligibilityList.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-xs">
                        {record.userWalletAddress}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "CLAIMED" ? "default" : "outline"
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(record.createdAt).toLocaleDateString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-muted-foreground"
                    >
                      <Users className="mx-auto h-8 w-8 mb-2" />
                      Belum ada alamat di daftar kelayakan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
