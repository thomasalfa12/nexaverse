import { InstitutionRequest } from "@/utils/institution";
import { useState } from "react";

interface Props {
  requests: InstitutionRequest[];
  onRegister: (institution: InstitutionRequest) => Promise<void>;
}

const typeMap: Record<number, string> = {
  1: "Universitas",
  2: "Sekolah",
  3: "Pemerintah",
  4: "Perusahaan",
  5: "Lainnya",
};

export default function RequestTable({ requests, onRegister }: Props) {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const handleRegister = async (req: InstitutionRequest, idx: number) => {
    setLoadingIndex(idx);
    try {
      await onRegister(req);
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg border">
      <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
          <tr>
            <th className="px-4 py-3">Nama</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Website</th>
            <th className="px-4 py-3">Jenis</th>
            <th className="px-4 py-3">Wallet</th>
            <th className="px-4 py-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="text-center py-6 text-gray-500 bg-white dark:bg-gray-900"
              >
                Tidak ada permintaan baru.
              </td>
            </tr>
          ) : (
            requests.map((req, i) => (
              <tr
                key={i}
                className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="px-4 py-3 font-medium">{req.name}</td>
                <td className="px-4 py-3">
                  <span title={req.contactEmail}>{req.contactEmail}</span>
                </td>
                <td className="px-4 py-3 bg-gray-50 dark:bg-gray-800">
                  {req.officialWebsite ? (
                    <a
                      href={
                        req.officialWebsite.startsWith("http")
                          ? req.officialWebsite
                          : `https://${req.officialWebsite}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {(() => {
                        try {
                          const url = new URL(
                            req.officialWebsite.startsWith("http")
                              ? req.officialWebsite
                              : `https://${req.officialWebsite}`
                          );
                          return url.hostname;
                        } catch {
                          return req.officialWebsite;
                        }
                      })()}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3">{typeMap[req.institutionType]}</td>
                <td className="px-4 py-3 font-mono text-xs truncate max-w-[200px]">
                  <span title={req.walletAddress}>{req.walletAddress}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleRegister(req, i)}
                    disabled={loadingIndex === i}
                    className={`px-4 py-1 rounded text-white ${
                      loadingIndex === i
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loadingIndex === i ? "Mendaftarkan..." : "Daftarkan"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
