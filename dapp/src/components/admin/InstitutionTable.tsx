"use client";

import { useState } from "react";
import { InstitutionRequest } from "@/utils/institution";
import Button from "@/components/ui/Button";
import { Trash } from "lucide-react";
import { useWriteContract } from "wagmi";
import { contracts } from "@/lib/contracts";
import { toast } from "sonner";

const typeMap: Record<number, string> = {
  1: "Universitas",
  2: "Sekolah",
  3: "Pemerintah",
  4: "Perusahaan",
  5: "Lainnya",
};

export default function InstitutionTable({
  data,
}: {
  data: InstitutionRequest[];
}) {
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const { writeContractAsync } = useWriteContract();

  const filtered = data.filter((inst) =>
    [inst.name, inst.contactEmail, inst.walletAddress].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleDelete = async (walletAddress: string) => {
    setDeleting(walletAddress);
    try {
      await writeContractAsync({
        address: contracts.registry.address,
        abi: contracts.registry.abi,
        functionName: "removeInstitution",
        args: [walletAddress],
      });
      toast.success("✅ Institusi berhasil dihapus dari registry");
    } catch (err) {
      console.error("❌ Gagal hapus institusi", err);
      toast.error("Gagal menghapus institusi");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
      {/* Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 bg-gray-50 dark:bg-gray-800">
        <input
          type="text"
          placeholder="Cari institusi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />
      </div>

      {/* Table */}
      <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
          <tr>
            <th className="p-4"></th>
            <th className="px-6 py-3">Nama</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Website</th>
            <th className="px-6 py-3">Jenis</th>
            <th className="px-6 py-3">Wallet</th>
            <th className="px-6 py-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((inst, i) => (
              <tr
                key={i}
                className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {inst.name}
                </td>
                <td className="px-6 py-4">{inst.contactEmail}</td>
                <td className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                  {inst.officialWebsite
                    ? (() => {
                        try {
                          const url = inst.officialWebsite.startsWith("http")
                            ? inst.officialWebsite
                            : `https://${inst.officialWebsite}`;
                          const hostname = new URL(url).hostname;
                          return (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              {hostname}
                            </a>
                          );
                        } catch {
                          return inst.officialWebsite;
                        }
                      })()
                    : "-"}
                </td>

                <td className="px-6 py-4">{typeMap[inst.institutionType]}</td>
                <td className="px-6 py-4 truncate max-w-[200px] font-mono text-xs">
                  {inst.walletAddress}
                </td>
                <td className="px-6 py-4 text-center">
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:underline px-2 py-1"
                    onClick={() => handleDelete(inst.walletAddress)}
                    disabled={deleting === inst.walletAddress}
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    {deleting === inst.walletAddress ? "Menghapus..." : "Hapus"}
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr className="bg-white dark:bg-gray-800">
              <td colSpan={7} className="text-center py-6 text-gray-500">
                Tidak ada institusi terdaftar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
