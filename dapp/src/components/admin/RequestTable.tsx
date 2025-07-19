"use client";

import { useEffect, useState } from "react";

import { InstitutionRequest } from "@/utils/institution";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
// import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  requests: InstitutionRequest[];
  onRegister: (institution: InstitutionRequest) => Promise<void>;
}

const typeMap: Record<number, string> = {
  1: "Universitas",
  2: "Sekolah",
  3: "Perusahaan",
  4: "Perusahaan",
  5: "Lainnya",
};

function parseWebsite(url: string): string {
  try {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    return new URL(fullUrl).hostname;
  } catch {
    return url;
  }
}

export default function RequestTable({ requests, onRegister }: Props) {
  const [pending, setPending] = useState<number | null>(null);
  const [items, setItems] = useState<InstitutionRequest[]>(requests);

  useEffect(() => {
    setItems(requests);
  }, [requests]);

  const handleRegister = async (req: InstitutionRequest, idx: number) => {
    setPending(idx);
    try {
      const res = await fetch("/api/admin/registry/approve-request", {
        method: "POST",
        body: JSON.stringify({ id: req.id }),
      });

      if (!res.ok) throw new Error("Gagal simpan ke InstitutionList");

      await onRegister(req); // proses blockchain
      toast.success(
        "✅ Institusi berhasil didaftarkan ke blockchain dan disimpan."
      );
    } catch (err) {
      console.error("Gagal mendaftarkan:", err);
      toast.error("❌ Gagal mendaftarkan institusi.");
    } finally {
      setPending(null);
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Permintaan Pendaftaran</h2>

      {items.length === 0 ? (
        <div className="text-muted-foreground text-sm px-2 py-6 text-center">
          Tidak ada permintaan baru.
        </div>
      ) : (
        <div className="className = overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((req, i) => (
                <TableRow key={req.id}>
                  <TableCell>{req.name}</TableCell>
                  <TableCell>
                    <span title={req.contactEmail}>{req.contactEmail}</span>
                  </TableCell>
                  <TableCell>
                    {req.officialWebsite?.trim() ? (
                      <a
                        href={
                          req.officialWebsite.startsWith("http")
                            ? req.officialWebsite
                            : `https://${req.officialWebsite}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {parseWebsite(req.officialWebsite)}
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {typeMap[req.institutionType] ?? "Tidak Dikenal"}
                  </TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[200px]">
                    <span title={req.walletAddress}>{req.walletAddress}</span>
                  </TableCell>
                  <TableCell>
                    {new Date(req.createdAt).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="default"
                      disabled={pending === i}
                      onClick={() => handleRegister(req, i)}
                    >
                      {pending === i ? "Mendaftarkan..." : "Daftarkan"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
