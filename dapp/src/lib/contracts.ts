import { abi as courseFactoryAbi } from "../../public/artifacts/src/CourseFactory.sol/CourseFactory.json";
import { abi as userSbtFactoryAbi } from "../../public/artifacts/src/UserSBTFactory.sol/UserSBTFactory.json";
import { abi as courseManagerAbi } from "../../public/artifacts/src/CourseManager.sol/CourseManager.json";
import { abi as nexaCourseFactoryAbi } from "../../public/artifacts/src/NexaCourseFactory.sol/NexaCourseFactory.json";
import { abi as nexaCourseAbi } from "../../public/artifacts/src/NexaCourse.sol/NexaCourse.json";
import { abi as userSbtAbi } from "../../public/artifacts/src/UserSBT.sol/UserSBT.json";
import { abi as verAbi } from "../../public/artifacts/src/VerifiedEntitySBT.sol/VerifiedEntitySBT.json";
import { abi as regAbi }  from "../../public/artifacts/src/ISBTRegistry.sol/ISBTRegistry.json";
import { abi as merkleClaimSbtFactoryAbi } from "../../public/artifacts/src/MerkleClaimSBTFactory.sol/MerkleClaimSBTFactory.json";
import { abi as merkleClaimSbtAbi } from "../../public/artifacts/src/MerkleClaimSBT.sol/MerkleClaimSBT.json";

export const contracts = {

   nexaCourseFactory: {
    address: process.env.NEXT_PUBLIC_NEXA_COURSE_FACTORY_ADDRESS as `0x${string}`,
    abi: nexaCourseFactoryAbi,
  },
  
  nexaCourse: {
    abi: nexaCourseAbi,
  },
  // Factory untuk alur pembuatan Kursus Multi-Modul
  courseFactory: {
    address: process.env.NEXT_PUBLIC_COURSE_FACTORY_ADDRESS as `0x${string}`,
    abi: courseFactoryAbi,
  },
  // FIX: Mengembalikan factory untuk alur pembuatan Kredensial Sederhana
  userSbtFactory: {
    address: process.env.NEXT_PUBLIC_USER_SBT_FACTORY_ADDRESS as `0x${string}`,
    abi: userSbtFactoryAbi,
  },
  merkleClaimSbtFactory: {
    address: process.env.NEXT_PUBLIC_MERKLE_SBT_FACTORY_ADDRESS as `0x${string}`,
    abi: merkleClaimSbtFactoryAbi,
  },
   merkleClaimSbt: {
    abi: merkleClaimSbtAbi,
  },
  // ABI untuk kontrak yang di-deploy secara dinamis
  courseManager: {
    abi: courseManagerAbi,
  },
  userSbt: {
    abi: userSbtAbi,
  },
  // Kontrak statis lainnya
  verified: {
    address: process.env.NEXT_PUBLIC_VERIFIED_SBT_ADDRESS as `0x${string}`,
    abi: verAbi,
  },
  registry: {
    address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`,
    abi: regAbi,
  },
};