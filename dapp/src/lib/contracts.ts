import { abi as userAbi } from "../../public/artifacts/src/UserSBT.sol/UserSBT.json";
import { abi as instAbi } from "../../public/artifacts/src/InstitutionSBT.sol/InstitutionSBT.json";
import { abi as regAbi }  from "../../public/artifacts/src/mock/MockRegistry.sol/MockRegistry.json";

export const contracts = {
  user: {
    address: process.env.NEXT_PUBLIC_USER_SBT_ADDRESS as `0x${string}`,
    abi: userAbi,
  },
  institution: {
    address: process.env.NEXT_PUBLIC_INSTITUTION_SBT_ADDRESS as `0x${string}`,
    abi: instAbi,
  },
  registry: {
    address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`,
    abi: regAbi,
  },
};
