import { abi as userAbi } from "../../public/artifacts/src/UserSBT.sol/UserSBT.json";
import { abi as verAbi } from "../../public/artifacts/src/VerifiedEntitySBT.sol/VerifiedEntitySBT.json";
import { abi as regAbi }  from "../../public/artifacts/src/ISBTRegistry.sol/ISBTRegistry.json";

export const contracts = {
  user: {
    address: process.env.NEXT_PUBLIC_USER_SBT_ADDRESS as `0x${string}`,
    abi: userAbi,
  },
  verified: {
    address: process.env.NEXT_PUBLIC_VERIFIED_SBT_ADDRESS as `0x${string}`,
    abi: verAbi,
  },
  registry: {
    address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`,
    abi: regAbi,
  },
};
