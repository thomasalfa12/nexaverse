// src/components/admin/RequestSBTTable.tsx

"use client";

import { useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatAddress } from "@/utils/formatAdd";

export interface SBTRequest {
  to: string;
  tokenId: string;
  uri: string;
}

export default function RequestSBTTable({
  requests,
  approved,
  onApprove,
}: {
  requests: SBTRequest[];
  approved: string[];
  onApprove: (req: SBTRequest) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleApproveClick = (req: SBTRequest) => {
    startTransition(() => onApprove(req));
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Daftar Permintaan Mint SBT
        </h3>

        <div className="overflow-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Wallet</th>
                <th className="px-4 py-2 text-left">Token ID</th>
                <th className="px-4 py-2 text-left">URI</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, i) => {
                const isApproved = approved.includes(req.to.toLowerCase());
                return (
                  <tr key={`${req.to}-${req.tokenId}`} className="border-t">
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{formatAddress(req.to)}</td>
                    <td className="px-4 py-2">{req.tokenId}</td>
                    <td className="px-4 py-2 truncate max-w-[200px]">
                      {req.uri ? (
                        <a
                          href={req.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {req.uri.slice(0, 30)}...
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic">
                          Belum ada URI
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2">
                      {isApproved ? (
                        <Badge variant="success">Disetujui</Badge>
                      ) : (
                        <Badge variant="warning">Menunggu</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {!isApproved && (
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleApproveClick(req)}
                        >
                          {isPending ? "Memproses..." : "Setujui"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {requests.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    Tidak ada permintaan mint yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
