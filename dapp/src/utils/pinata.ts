const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

export function formatIpfsUrl(ipfsUri: string | null | undefined): string {
  if (!ipfsUri || !ipfsUri.startsWith('ipfs://')) {
    return ipfsUri || ""; // Kembalikan string kosong atau URL asli jika tidak valid
  }
  return ipfsUri.replace('ipfs://', IPFS_GATEWAY);
}


export function resolveIpfsUrl(url: string | null | undefined): string {
    // Kembalikan placeholder default jika url tidak valid
    if (!url) {
        return "/placeholder-avatar.jpg"; // Pastikan file ini ada di folder /public
    }

    // Jika URL adalah IPFS, ubah menjadi URL gateway yang sudah Anda izinkan
    if (url.startsWith("ipfs://")) {
        const cid = url.substring(7);
        // Kita gunakan gateway pinata karena sudah ada di config Anda
        return `https://gateway.pinata.cloud/ipfs/${cid}`;
    }

    // Jika URL sudah valid (misal dari utfs.io atau dicebear.com), kembalikan apa adanya
    return url;
}