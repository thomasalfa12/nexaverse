"use server";

import { uploadToPinata, uploadJsonToPinata } from "@/lib/pinata-uploader";
import { getAuth } from "@/lib/server/auth";

// FIX: Menambahkan `imageUrl` ke interface hasil
interface MetadataResult {
  success: boolean;
  error?: string;
  metadataURI?: string;
  imageUrl?: string;
}

export async function prepareTemplateMetadataAction(formData: FormData): Promise<MetadataResult> {
  try {
    const { user } = await getAuth();
    if (!user?.address) return { success: false, error: "Unauthorized" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File;
    const symbol = formData.get("symbol") as string;

    if (!title || !description || !imageFile || !symbol) {
      return { success: false, error: "Data tidak lengkap untuk metadata." };
    }

    const imageUrl = await uploadToPinata(imageFile);
    const metadata = { name: title, description, image: imageUrl };
    const metadataURI = await uploadJsonToPinata(metadata, `${symbol}-metadata.json`);

    // FIX: Mengembalikan `imageUrl` di dalam objek hasil
    return { success: true, metadataURI, imageUrl };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}