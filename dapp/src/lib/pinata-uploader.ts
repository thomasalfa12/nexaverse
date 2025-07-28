// lib/pinata-uploader.ts
import axios from 'axios';

// Environment variables
const PINATA_JWT_CLIENT = process.env.NEXT_PUBLIC_PINATA_JWT;
const PINATA_JWT_SERVER = process.env.PINATA_JWT;

// Types
export interface UploadResult {
  ipfsHash: string;
  ipfsUrl: string;
  size: number;
}

export interface UploadOptions {
  metadata?: {
    name?: string;
    keyvalues?: Record<string, string | number | boolean>;
  };
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

// Default options
const DEFAULT_OPTIONS: UploadOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
};

// Utility functions
const validateFile = (file: File, options: UploadOptions = DEFAULT_OPTIONS) => {
  // Size validation
  if (options.maxSize && file.size > options.maxSize) {
    throw new Error(`File size exceeds ${Math.round(options.maxSize / 1024 / 1024)}MB limit`);
  }

  // Type validation
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    throw new Error(`File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`);
  }
};

const createFormData = (file: File, options: UploadOptions = {}) => {
  const formData = new FormData();
  formData.append('file', file);

  // Add metadata
  if (options.metadata) {
    const metadata = JSON.stringify({
      name: options.metadata.name || file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        fileType: file.type,
        originalSize: file.size,
        ...options.metadata.keyvalues,
      }
    });
    formData.append('pinataMetadata', metadata);
  }

  // Add pinning options
  const pinataOptions = JSON.stringify({
    cidVersion: 1, // Use CIDv1 for better compatibility
  });
  formData.append('pinataOptions', pinataOptions);

  return formData;
};

// CORE UPLOAD FUNCTION (works both client and server side)
const uploadToIPFS = async (
  file: File, 
  jwtToken: string, 
  options: UploadOptions = DEFAULT_OPTIONS
): Promise<UploadResult> => {
  validateFile(file, options);
  const formData = createFormData(file, options);

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'multipart/form-data'
        },
        maxBodyLength: Infinity,
        timeout: 60000,
      }
    );

    return {
      ipfsHash: response.data.IpfsHash,
      ipfsUrl: `ipfs://${response.data.IpfsHash}`,
      size: response.data.PinSize
    };

  } catch (error) {
    console.error("IPFS upload error:", error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.message;
      const statusCode = error.response?.status;
      
      if (statusCode === 401) {
        throw new Error("Invalid Pinata JWT token. Please check your API key.");
      } else if (statusCode === 402) {
        throw new Error("Pinata account limit exceeded. Please upgrade your plan.");
      } else if (statusCode === 429) {
        throw new Error("Rate limit exceeded. Please wait and try again.");
      }
      
      throw new Error(`Upload failed: ${errorMessage}`);
    }
    
    throw new Error("Failed to upload file. Please try again.");
  }
};

// 1. CLIENT-SIDE UPLOAD (for client components)
export const uploadToPinataClient = async (
  file: File, 
  options: UploadOptions = DEFAULT_OPTIONS
): Promise<string> => {
  if (!PINATA_JWT_CLIENT) {
    throw new Error("Pinata JWT key is not configured. Please add NEXT_PUBLIC_PINATA_JWT to your .env.local file.");
  }

  const result = await uploadToIPFS(file, PINATA_JWT_CLIENT, options);
  return result.ipfsUrl;
};

export const uploadJsonToPinata = async (jsonData: object, fileName: string): Promise<string> => {
  if (!PINATA_JWT_SERVER) {
    throw new Error("Pinata JWT key tidak terkonfigurasi di server.");
  }
  const data = JSON.stringify({
    pinataContent: jsonData,
    pinataMetadata: { name: fileName }
  });
  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT_SERVER}`
        }
      }
    );
    return `ipfs://${response.data.IpfsHash}`;
  } catch (error) {
    console.error("IPFS JSON upload error:", error);
    throw new Error("Gagal mengunggah metadata JSON ke IPFS.");
  }
};

// 2. SERVER-SIDE UPLOAD (for server actions/API routes)
export const uploadToPinataServer = async (
  file: File, 
  options: UploadOptions = DEFAULT_OPTIONS
): Promise<string> => {
  if (!PINATA_JWT_SERVER) {
    throw new Error("Pinata JWT key is not configured on server. Please add PINATA_JWT to your .env.local file.");
  }

  const result = await uploadToIPFS(file, PINATA_JWT_SERVER, options);
  return result.ipfsUrl;
};

// 3. API ROUTE UPLOAD (via /api/upload endpoint)
export const uploadToPinataViaAPI = async (
  file: File, 
  options: UploadOptions = DEFAULT_OPTIONS
): Promise<string> => {
  validateFile(file, options);
  
  const formData = new FormData();
  formData.append('file', file);
  
  if (options) {
    formData.append('options', JSON.stringify(options));
  }

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const data = await response.json();
    return data.ipfsUrl;
  } catch (error) {
    console.error("API upload error:", error);
    throw new Error(error instanceof Error ? error.message : 'Upload failed');
  }
};

// 4. SMART UPLOAD (automatically chooses best method for CLIENT-SIDE)
export const uploadToPinata = async (
  file: File, 
  options: UploadOptions = DEFAULT_OPTIONS
): Promise<string> => {
  // Check if running on server-side
  if (typeof window === 'undefined') {
    // We're on server-side, use server method
    return uploadToPinataServer(file, options);
  }

  // We're on client-side, try API route first, then fallback to direct upload
  try {
    return await uploadToPinataViaAPI(file, options);
  } catch (apiError) {
    console.warn("API upload failed, falling back to direct upload:", apiError);
    
    if (PINATA_JWT_CLIENT) {
      return await uploadToPinataClient(file, options);
    }
    
    throw new Error("No upload method available. Please configure Pinata JWT or create upload API route.");
  }
};

// 5. UTILITY FUNCTIONS
export const getIPFSUrl = (hash: string, gateway = 'https://gateway.pinata.cloud'): string => {
  return `${gateway}/ipfs/${hash}`;
};

export const extractHashFromIPFS = (ipfsUrl: string): string => {
  return ipfsUrl.replace('ipfs://', '');
};

// Export default for backward compatibility
export default uploadToPinata;