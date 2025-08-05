// File: hooks/useCoverUploader.ts
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// import { uploadFileToIPFS } from "@/lib/ipfs-uploader";

// FIX: Mendefinisikan interface yang spesifik untuk options
// Ini menggantikan penggunaan 'any' dan membuat kode lebih aman.
interface UploadOptions {
  metadata: {
    name: string;
  };
}

// Placeholder function jika uploader Anda belum siap
async function uploadFileToIPFS(file: File, options: UploadOptions): Promise<string> {
    console.log("Uploading file:", file.name, "with options:", options);
    // Simulasi upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Kembalikan URL placeholder. Ganti ini dengan URL asli dari IPFS.
    return "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
}

export function useCoverUploader() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setIsLoading(true);
    const uploadToast = toast.loading("Mengunggah gambar cover...");

    try {
      // FIX: Menggunakan interface 'UploadOptions' yang sudah kita buat
      const ipfsUrl = await uploadFileToIPFS(file, {
        metadata: { name: `cover-${file.name}` },
      });

      const response = await fetch("/api/me/profile/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: ipfsUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menyimpan gambar cover.");
      }

      toast.success("Gambar cover berhasil diperbarui!", { id: uploadToast });
      router.refresh();

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan.";
      toast.error(errorMessage, { id: uploadToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  return {
    isLoading,
    fileInputRef,
    triggerFileDialog,
    handleFileChange,
  };
}