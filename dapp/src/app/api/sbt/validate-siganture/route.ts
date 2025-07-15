import { NextRequest, NextResponse } from "next/server";
import { contracts } from "@/lib/contracts";
import { wagmiConfig } from "@/lib/wallet";
import { getPublicClient } from "@wagmi/core";
import { getDomain, getTypes, sanitizeURI } from "@/utils/sbtSignature"
import { recoverTypedDataAddress } from "viem";

export async function POST(req: NextRequest) {
  const { tokenId, to, uri, deadline, signature } = await req.json();

  const client = getPublicClient(wagmiConfig);
  const chainId = await client.getChainId();
  const domain = getDomain(chainId);

  const recovered = await recoverTypedDataAddress({
    domain,
    types: getTypes(),
    primaryType: "Claim",
    message: {
      tokenId: BigInt(tokenId),
      to: to as `0x${string}`,
      uri: sanitizeURI(uri),
      deadline: BigInt(deadline),
    },
    signature
  });

  const onChainOwner = ( await client.readContract({
    address: contracts.institution.address,
    abi: contracts.institution.abi,
    functionName: "owner",
  })) as `0x${string}`;

  const valid = recovered.toLowerCase() === onChainOwner.toLowerCase();

  return NextResponse.json({
    ok: true,
    valid,
    recovered,
    expected: onChainOwner,
  });
}