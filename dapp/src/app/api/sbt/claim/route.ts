import { writeContract, getWalletClient } from "@wagmi/core";
import { contracts } from "@/lib/contracts";
import { wagmiConfig } from "@/lib/walletProviders/wallet";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { tokenId, uri, deadline, signature } = await req.json();
  const client = await getWalletClient(wagmiConfig);

  if (!client) return NextResponse.json({ error: "No wallet client" }, { status: 400 });

  const result = await writeContract(wagmiConfig, {
    address: contracts.institution.address,
    abi: contracts.institution.abi,
    functionName: "claim",
    account: client.account.address,
    args: [BigInt(tokenId), uri, BigInt(deadline), signature],
  });

  return NextResponse.json({ ok: true, tx: result });
}
