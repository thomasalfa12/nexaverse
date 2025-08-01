"use server";

// 1. Impor dari library baru kita
import { uploadFileToIPFS, uploadJsonToIPFS } from "@/lib/ipfs-uploader";
import { getAppSession } from "@/lib/auth";

interface MetadataResult {
  success: boolean;
  error?: string;
  metadataURI?: string;
  imageUrl?: string;
}

export async function prepareTemplateMetadataAction(formData: FormData): Promise<MetadataResult> {
  try {
    const session = await getAppSession();
    // 2. Sesuaikan pengecekan otentikasi
    if (!session?.user?.address) {
      return { success: false, error: "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File;
    const symbol = formData.get("symbol") as string;

    if (!title || !description || !imageFile || !symbol) {
      return { success: false, error: "Data tidak lengkap untuk metadata." };
    }

    // 3. Gunakan fungsi upload file yang baru
    const imageUrl = await uploadFileToIPFS(imageFile);
    const metadata = { name: title, description, image: imageUrl };
    
    // 4. Gunakan fungsi upload JSON yang baru
    const metadataURI = await uploadJsonToIPFS(metadata, `${symbol}-metadata.json`);

    return { success: true, metadataURI, imageUrl };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
