"use client";

import { useState } from "react";
import { useSignTypedData } from "wagmi";
import { SBTRequest } from "@/utils/sbt";
import { toast } from "sonner";
import { contracts } from "@/lib/contracts";
import Button from "@/components/ui/Button";

interface Props {
  requests: SBTRequest[];
  signed: bigint[];
  onSigned?: (tokenId: string) => void;
}

export default function RequestSBTTable({ requests, signed, onSigned }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { signTypedDataAsync } = useSignTypedData();

  const handleSign = async (req: SBTRequest) => {
    try {
      setLoadingId(req.to);

      const signature = await signTypedDataAsync({
        domain: {
          name: "InstitutionSBT",
          version: "1",
          chainId: 84532, // baseSepolia
          verifyingContract: contracts.institution.address,
        },
        types: {
          Claim: [
            { name: "to", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "uri", type: "string" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "Claim",
        message: {
          to: req.to as `0x${string}`,
          tokenId: BigInt(req.tokenId),
          uri: req.uri,
          deadline: BigInt(req.deadline),
        },
      });

      const payload = {
        to: req.to,
        tokenId: req.tokenId.toString(),
        uri: req.uri,
        deadline: req.deadline.toString(),
        signature,
      };

      const res = await fetch("/api/admin/signed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan signature");
      }

      toast.success("✅ Signature berhasil disimpan");

      // Update state
      onSigned?.(req.tokenId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("[handleSign]", err);
      toast.error("❌ Gagal menandatangani: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Wallet</th>
            <th className="px-3 py-2">Token ID</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r, i) => {
            const isSigned = signed.includes(BigInt(r.tokenId));
            return (
              <tr key={i} className="border-t">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2 truncate max-w-[200px]">{r.to}</td>
                <td className="px-3 py-2 truncate max-w-[300px]">
                  {r.tokenId}
                </td>
                <td className="px-3 py-2">
                  {isSigned ? (
                    <span className="text-green-600 font-medium">
                      ✅ Signed
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleSign(r)}
                      disabled={loadingId === r.to}
                    >
                      {loadingId === r.to ? "Signing..." : "Tanda Tangan"}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
