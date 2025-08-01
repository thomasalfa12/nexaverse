// src/app/api/uploadthing/core.ts

import { createUploadthing, type FileRouter } from "uploadthing/next";
// FIX: Impor helper sesi yang benar
import { getAppSession } from "@/lib/auth";

const f = createUploadthing();

// Middleware otentikasi yang disederhanakan
const handleAuth = async () => {
  // Cukup periksa apakah ada sesi yang valid
  const session = await getAppSession();
  
  // Jika tidak ada user di sesi, tolak upload
  if (!session?.user?.id) throw new Error("Unauthorized: Must be logged in to upload files.");
  
  // Kembalikan ID user untuk metadata
  return { userId: session.user.id };
};

// Definisikan router file Anda
export const ourFileRouter = {
  courseImage: f({ image: { maxFileSize: "1MB", maxFileCount: 1 } })
    // Jalankan middleware otentikasi yang sederhana
    .middleware(handleAuth)
    // `onUploadComplete` berjalan setelah upload selesai
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;