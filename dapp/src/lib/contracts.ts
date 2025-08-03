// src/lib/contracts.ts

// --- LANGKAH 1: Impor seluruh file JSON sebagai objek ---
import courseFactoryJson from "../../public/artifacts/src/CourseFactory.sol/CourseFactory.json";
import userSbtFactoryJson from "../../public/artifacts/src/UserSBTFactory.sol/UserSBTFactory.json";
import courseManagerJson from "../../public/artifacts/src/CourseManager.sol/CourseManager.json";
import nexaCourseFactoryJson from "../../public/artifacts/src/NexaCourseFactory.sol/NexaCourseFactory.json";
import nexaCourseJson from "../../public/artifacts/src/NexaCourse.sol/NexaCourse.json";
import userSbtJson from "../../public/artifacts/src/UserSBT.sol/UserSBT.json";
import verifiedEntitySbtJson from "../../public/artifacts/src/VerifiedEntitySBT.sol/VerifiedEntitySBT.json";
import isbtRegistryJson from "../../public/artifacts/src/ISBTRegistry.sol/ISBTRegistry.json";
import merkleClaimSbtFactoryJson from "../../public/artifacts/src/MerkleClaimSBTFactory.sol/MerkleClaimSBTFactory.json";
import merkleClaimSbtJson from "../../public/artifacts/src/MerkleClaimSBT.sol/MerkleClaimSBT.json";

// --- LANGKAH 2: Ambil dan EKSPOR setiap ABI secara individual ---
export const courseFactoryAbi = courseFactoryJson.abi;
export const userSbtFactoryAbi = userSbtFactoryJson.abi;
export const courseManagerAbi = courseManagerJson.abi;
export const nexaCourseFactoryAbi = nexaCourseFactoryJson.abi;
export const nexaCourseAbi = nexaCourseJson.abi;
export const userSbtAbi = userSbtJson.abi;
export const verAbi = verifiedEntitySbtJson.abi;
export const regAbi = isbtRegistryJson.abi;
export const merkleClaimSbtFactoryAbi = merkleClaimSbtFactoryJson.abi;
export const merkleClaimSbtAbi = merkleClaimSbtJson.abi;

// --- LANGKAH 3: Ekspor objek 'contracts' yang HANYA berisi alamat ---
// Ini membuat objek ini sangat ringan untuk diimpor.
export const contracts = {
  nexaCourseFactory: {
    address: process.env.NEXT_PUBLIC_NEXA_COURSE_FACTORY_ADDRESS as `0x${string}`,
  },
  courseFactory: {
    address: process.env.NEXT_PUBLIC_COURSE_FACTORY_ADDRESS as `0x${string}`,
  },
  userSbtFactory: {
    address: process.env.NEXT_PUBLIC_USER_SBT_FACTORY_ADDRESS as `0x${string}`,
  },
  merkleClaimSbtFactory: {
    address: process.env.NEXT_PUBLIC_MERKLE_SBT_FACTORY_ADDRESS as `0x${string}`,
  },
  verified: {
    address: process.env.NEXT_PUBLIC_VERIFIED_SBT_ADDRESS as `0x${string}`,
  },
  registry: {
    address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`,
  },
};