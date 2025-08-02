"use server";

import { uploadFileToIPFS } from "@/lib/ipfs-uploader";

// Action ini akan berjalan di server, jadi aman untuk menggunakan ipfs-uploader.
export async function uploadCourseImageAction(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "File tidak ditemukan." };
    }

    // Panggil fungsi inti dari ipfs-uploader yang sudah Anda buat
    const ipfsUrl = await uploadFileToIPFS(file);

    return { success: true, url: ipfsUrl };
  } catch (error) {
    console.error("Upload action error:", error);
    return { success: false, error: (error as Error).message };
  }
}