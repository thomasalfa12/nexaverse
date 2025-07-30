import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getAuth } from "@/lib/server/auth"; // Gunakan helper auth Anda

const f = createUploadthing();

// Fungsi untuk autentikasi user sebelum upload
const handleAuth = async () => {
  const { user } = await getAuth();
  if (!user?.entityId) throw new Error("Unauthorized");
  // Kembalikan ID user untuk digunakan jika perlu
  return { userId: user.entityId };
};

// Definisikan router file Anda
export const ourFileRouter = {
  // Definisikan "endpoint" upload, misal: courseImage
  courseImage: f({ image: { maxFileSize: "1MB", maxFileCount: 1 } })
    // Jalankan middleware otentikasi sebelum upload
    .middleware(() => handleAuth())
    // `onUploadComplete` berjalan setelah upload selesai
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;