// File: app/dashboard/(main)/profile/_components/ProfileBanner.tsx
"use client";

import Image from "next/image";
import { resolveIpfsUrl } from "@/utils/pinata";
import type { ProfileUser } from "../page";
import { useCoverUploader } from "@/hooks/useCoverUploader";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";

export function ProfileBanner({ user }: { user: ProfileUser }) {
  const { isLoading, fileInputRef, triggerFileDialog, handleFileChange } =
    useCoverUploader();

  // FIX: Menggunakan warna dari tema, bukan hardcoded dark gradient
  const EmptyCoverPreview = () => <div className="absolute inset-0 bg-muted" />;

  return (
    <div className="relative w-full h-48 md:h-64 group bg-muted">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/gif, image/webp"
        disabled={isLoading}
      />

      <div className="absolute inset-0">
        {user.coverImage ? (
          <>
            <Image
              src={resolveIpfsUrl(user.coverImage)}
              alt="Cover Profile"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/20" />
          </>
        ) : (
          <EmptyCoverPreview />
        )}
      </div>

      <div className="absolute bottom-4 right-4">
        {/* FIX: Tombol menggunakan variant standar agar theme-aware */}
        <Button
          size="sm"
          variant="secondary"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
          onClick={triggerFileDialog}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Ganti Cover
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
