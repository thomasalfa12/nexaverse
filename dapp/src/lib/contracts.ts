import { abi as factoryAbi } from "../../public/artifacts/src/UserSBTFactory.sol/UserSBTFactory.json";
import { abi as verAbi } from "../../public/artifacts/src/VerifiedEntitySBT.sol/VerifiedEntitySBT.json";
import { abi as regAbi }  from "../../public/artifacts/src/ISBTRegistry.sol/ISBTRegistry.json";

export const contracts = {
   factory: {
    address: process.env.NEXT_PUBLIC_USER_SBT_FACTORY_ADDRESS as `0x${string}`,
    abi: factoryAbi,
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
