import axios from 'axios';
import { Buffer } from 'buffer';

// Tipe data untuk opsi upload, termasuk metadata kustom
export interface UploadOptions {
  metadata?: {
    name?: string;
    keyvalues?: Record<string, string | number | boolean | undefined | null>;
  };
}

// --- Helper untuk setiap Layanan Pinning ---

async function uploadFileToPinata(file: File, options?: UploadOptions): Promise<string> {
  console.log("Mencoba upload file ke Pinata...");
  const formData = new FormData();
  formData.append('file', file);
  
  // Gunakan metadata dari options jika ada, jika tidak gunakan nama file
  const metadata = JSON.stringify({ 
    name: options?.metadata?.name || file.name,
    keyvalues: options?.metadata?.keyvalues || {}
  });
  formData.append('pinataMetadata', metadata);

  const pinataOptions = JSON.stringify({ cidVersion: 1 });
  formData.append('pinataOptions', pinataOptions);

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    headers: {
      'Authorization': `Bearer ${process.env.PINATA_JWT}`,
    },
  });
  console.log("Sukses upload file ke Pinata!");
  return `ipfs://${res.data.IpfsHash}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function uploadFileToInfura(file: File, _options?: UploadOptions): Promise<string> {
  // Infura tidak mendukung metadata kustom melalui endpoint ini, jadi 'options' diabaikan
  console.log("Mencoba upload file ke Infura...");
  const formData = new FormData();
  formData.append('file', file);

  const projectId = process.env.INFURA_IPFS_PROJECT_ID;
  const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;
  
  const res = await axios.post("https://ipfs.infura.io:5001/api/v0/add", formData, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`,
    },
  });
  console.log("Sukses upload file ke Infura!");
  return `ipfs://${res.data.Hash}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function uploadFileToWeb3Storage(file: File, _options?: UploadOptions): Promise<string> {
    // Web3.Storage tidak mendukung metadata kustom melalui endpoint ini, jadi 'options' diabaikan
    console.log("Mencoba upload file ke Web3.Storage...");
    const res = await axios.post('https://api.web3.storage/upload', file, {
        headers: {
            'Authorization': `Bearer ${process.env.WEB3_STORAGE_TOKEN}`,
            'Content-Type': file.type,
        },
    });
    console.log("Sukses upload file ke Web3.Storage!");
    return `ipfs://${res.data.cid}`;
}

// --- Helper untuk Upload JSON ---

async function uploadJsonToPinata(jsonData: object, fileName: string): Promise<string> {
  console.log("Mencoba upload JSON ke Pinata...");
  const data = JSON.stringify({
    pinataContent: jsonData,
    pinataMetadata: { name: fileName }
  });
  const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", data, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PINATA_JWT}`
    }
  });
  console.log("Sukses upload JSON ke Pinata!");
  return `ipfs://${res.data.IpfsHash}`;
}

// --- Fungsi Dispatcher Utama ---

const fileUploadServices = [uploadFileToPinata, uploadFileToInfura, uploadFileToWeb3Storage];
const jsonUploadServices = [uploadJsonToPinata];

/**
 * Mengunggah file ke IPFS menggunakan beberapa layanan secara berurutan sebagai fallback.
 */
export async function uploadFileToIPFS(file: File, options?: UploadOptions): Promise<string> {
  for (const service of fileUploadServices) {
    try {
      if (
        (service.name === 'uploadFileToPinata' && !process.env.PINATA_JWT) ||
        (service.name === 'uploadFileToInfura' && (!process.env.INFURA_IPFS_PROJECT_ID || !process.env.INFURA_IPFS_PROJECT_SECRET)) ||
        (service.name === 'uploadFileToWeb3Storage' && !process.env.WEB3_STORAGE_TOKEN)
      ) {
        console.warn(`Melewatkan ${service.name} karena kunci API tidak ada.`);
        continue;
      }
      
      const ipfsUrl = await service(file, options);
      return ipfsUrl;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Gagal upload file menggunakan ${service.name}:`, errorMessage);
    }
  }
  throw new Error("Semua layanan pinning file IPFS gagal. Mohon coba beberapa saat lagi.");
}

/**
 * Mengunggah objek JSON ke IPFS menggunakan beberapa layanan sebagai fallback.
 */
export async function uploadJsonToIPFS(jsonData: object, fileName: string): Promise<string> {
  for (const service of jsonUploadServices) {
    try {
      if (service.name === 'uploadJsonToPinata' && !process.env.PINATA_JWT) {
        console.warn(`Melewatkan ${service.name} karena kunci API tidak ada.`);
        continue;
      }
      const ipfsUrl = await service(jsonData, fileName);
      return ipfsUrl;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Gagal upload JSON menggunakan ${service.name}:`, errorMessage);
    }
  }
  throw new Error("Semua layanan pinning JSON IPFS gagal. Mohon coba beberapa saat lagi.");
}
