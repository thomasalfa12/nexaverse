// src/lib/checkRegistryOnChain.ts
import { readContract } from "@wagmi/core";
import { contracts } from "@/lib/contracts";
import { wagmiConfig } from "@/lib/wallet";

export async function checkIsInstitution(address: `0x${string}`): Promise<boolean> {
  const result = await readContract(wagmiConfig, {
    address: contracts.registry.address,
    abi: contracts.registry.abi,
    functionName: "isRegisteredInstitution",
    args: [address],
  });

  return result as boolean;
}
