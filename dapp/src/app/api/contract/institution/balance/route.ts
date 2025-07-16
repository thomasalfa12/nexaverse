import { NextRequest, NextResponse } from "next/server";
import { contracts } from "@/lib/contracts";
import { readContract } from "viem/actions";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

  const balance = (await readContract(client, {
  address: contracts.institution.address,
  abi: contracts.institution.abi,
  functionName: "balanceOf",
  args: [address],
})) as bigint;


    return NextResponse.json({ balance: balance.toString() }); // ✅ FIXED
  } catch (err) {
    console.error("Error fetching balance", err);
    return NextResponse.json(
      { error: "Failed to read balance" },
      { status: 500 }
    );
  }
}
