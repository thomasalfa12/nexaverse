// src/lib/checkRegistryOnChain.ts
import { readContract } from "@wagmi/core";
import { contracts } from "@/lib/contracts";
import { wagmiConfig } from "@/lib/wallet";

export async function checkRegistryOnChain(address: `0x${string}`): Promise<boolean> {
  try {
  const result = await readContract(wagmiConfig, {
    address: contracts.registry.address,
    abi: contracts.registry.abi,
    functionName: "isRegisteredInstitution",
    args: [address],
  });

  return result as boolean;
   } catch (err) {
    console.error('[checkRegistryOnChain]', err)
    return false
  }
}
