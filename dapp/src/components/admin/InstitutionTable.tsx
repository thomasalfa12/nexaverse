"use client";

import { useState, useMemo } from "react";
import type { Institution } from "@prisma/client";

// Shadcn UI & Lucide Icons
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Copy,
  Check,
  ExternalLink,
  ArrowUpDown,
  Search,
  Building2,
} from "lucide-react";

type Props = {
  data: Institution[];
};

type SortKey = keyof Institution | null;

const typeMap: Record<number, string> = {
  1: "Universitas",
  2: "Sekolah",
  3: "Perusahaan",
  4: "Organisasi",
  5: "Lainnya",
};

// Hook kustom untuk fungsionalitas copy-to-clipboard
const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return { isCopied, handleCopy };
};

// Komponen kecil untuk sel Wallet agar lebih rapi
const WalletCell = ({ address }: { address: string }) => {
  const { isCopied, handleCopy } = useCopyToClipboard();
  const explorerUrl = `https://sepolia.basescan.org/address/${address}`;

  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="truncate">{address}</span>
          </TooltipTrigger>
          <TooltipContent>{address}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => handleCopy(address)}
      >
        {isCopied ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
      <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <ExternalLink className="h-3 w-3" />
        </Button>
      </a>
    </div>
  );
};

export default function InstitutionTable({ data }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  }>({ key: "createdAt", direction: "descending" });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const handleSort = (key: SortKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    return data.filter(
      (inst) =>
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    const sortableData = [...filteredData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle className="text-xl">Daftar Institusi Terdaftar</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau wallet..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Nama Institusi <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("registeredAt")}
                >
                  <div className="flex items-center gap-2">
                    Tgl. Terdaftar <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell>
                      <div className="font-medium">{inst.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {typeMap[inst.institutionType] ?? "Tidak Dikenal"}
                      </div>
                    </TableCell>
                    <TableCell>{inst.contactEmail}</TableCell>
                    <TableCell>
                      <WalletCell address={inst.walletAddress} />
                    </TableCell>
                    <TableCell>
                      {inst.registeredAt
                        ? new Date(inst.registeredAt).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "long", year: "numeric" }
                          )
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-48 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <Building2 className="h-12 w-12 text-gray-300" />
                      <div>
                        <p className="font-semibold">Tidak ada data</p>
                        <p className="text-sm">
                          Tidak ada institusi yang cocok dengan pencarian Anda.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Kontrol Paginasi */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
