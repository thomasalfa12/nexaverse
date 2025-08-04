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

// --- LANGKAH 3: Ekspor objek 'contracts' yang berisi alamat DAN ABI ---
// ✅ FIX: Tambahkan ABI ke setiap contract untuk kemudahan akses
export const contracts = {
  nexaCourseFactory: {
    address: process.env.NEXT_PUBLIC_NEXA_COURSE_FACTORY_ADDRESS as `0x${string}`,
    abi: nexaCourseFactoryAbi
  },
  nexaCourse: {
    // ✅ TAMBAHAN: Contract individual NexaCourse dengan ABI
    abi: nexaCourseAbi
  },
  courseFactory: {
    address: process.env.NEXT_PUBLIC_COURSE_FACTORY_ADDRESS as `0x${string}`,
    abi: courseFactoryAbi
  },
  userSbtFactory: {
    address: process.env.NEXT_PUBLIC_USER_SBT_FACTORY_ADDRESS as `0x${string}`,
    abi: userSbtFactoryAbi
  },
  merkleClaimSbtFactory: {
    address: process.env.NEXT_PUBLIC_MERKLE_SBT_FACTORY_ADDRESS as `0x${string}`,
    abi: merkleClaimSbtFactoryAbi
  },
  verified: {
    address: process.env.NEXT_PUBLIC_VERIFIED_SBT_ADDRESS as `0x${string}`,
    abi: verAbi
  },
  registry: {
    address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`,
    abi: regAbi
  },
};

// --- LANGKAH 4: Helper function untuk mendapatkan contract dengan address dan ABI ---
export const getContractConfig = (contractAddress: `0x${string}`, contractType: 'nexaCourse' | 'courseFactory' | 'userSbtFactory') => {
  const contract = contracts[contractType];
  if (!contract?.abi) {
    throw new Error(`ABI not found for contract type: ${contractType}`);
  }
  
  return {
    address: contractAddress,
    abi: contract.abi
  };
};