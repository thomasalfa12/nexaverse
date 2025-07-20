// File: lib/server/ipfs-utils.ts

// FIX: Impor CID class utama, yang merupakan cara yang benar untuk mem-parsing CID.
import { CID } from "multiformats/cid";
import { bytesToHex } from "viem";

/**
 * Mengonversi string IPFS CID v0 (misalnya, "Qm...") menjadi format bytes32 hex.
 * Smart contract akan menyimpan format bytes32 ini untuk menghemat gas.
 * @param cid String IPFS CID v0.
 * @returns Representasi bytes32 dari CID dalam format hex string (`0x...`).
 */
export function cidToBytes32(cid: string): `0x${string}` {
  // FIX: Gunakan CID.parse() yang cerdas untuk menangani berbagai format CID,
  // termasuk string "Qm..." klasik tanpa prefix.
  const cidObj = CID.parse(cid);

  // Properti `multihash` berisi hash lengkap, dan properti `digest`
  // di dalamnya adalah 32 byte hash murni yang kita butuhkan.
  const digest = cidObj.multihash.digest;

  return bytesToHex(digest);
}

