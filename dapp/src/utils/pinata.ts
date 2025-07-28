const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

export function formatIpfsUrl(ipfsUri: string | null | undefined): string {
  if (!ipfsUri || !ipfsUri.startsWith('ipfs://')) {
    return ipfsUri || ""; // Kembalikan string kosong atau URL asli jika tidak valid
  }
  return ipfsUri.replace('ipfs://', IPFS_GATEWAY);
}