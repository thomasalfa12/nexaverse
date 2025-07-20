import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

/**
 * Membuat instance Viem Wallet Client yang berjalan di sisi server.
 * Client ini menggunakan private key yang disimpan dengan aman di environment variables
 * untuk menandatangani dan mengirim transaksi atas nama admin.
 *
 * PENTING: Jangan pernah mengekspos private key ini ke sisi klien!
 */
export function getServerWalletClient() {
  const privateKey = process.env.ADMIN_PRIVATE_KEY as `0x${string}` | undefined;

  if (!privateKey) {
    throw new Error("ADMIN_PRIVATE_KEY tidak ditemukan di environment variables. Proses tidak bisa dilanjutkan.");
  }

  const account = privateKeyToAccount(privateKey);

  const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  }).extend(publicActions); // extend dengan publicActions agar bisa waitForTransactionReceipt

  return client;
}
