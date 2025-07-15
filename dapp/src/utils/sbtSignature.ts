import { keccak256 } from "viem";
import { contracts } from "@/lib/contracts";
import { stringToBytes } from "viem/utils";

export const getDomain = (chainId: number) => ({
  name: "InstitutionSBT",
  version: "1",
  chainId,
  verifyingContract: contracts.institution.address,
});

export function getTypes()  {
  return {
 Claim: [
    { name: "tokenId", type: "uint256" },
    { name: "to", type: "address" },
    { name: "uri", type: "string" },
    { name: "deadline", type: "uint256" },
  ],
  };
};

export const sanitizeURI = (uri: string) => uri.trim().toLowerCase();

export const hashURI = (uri: string) => {
  const sanitized = sanitizeURI(uri);
  return keccak256(stringToBytes(sanitized));
};