"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X } from "lucide-react";
import { Button } from "./button";

interface ImageUploadProps {
  // `onChange` sekarang akan mengembalikan objek File atau null
  onChange: (file: File | null) => void;
  // `value` bisa berupa string (URL awal) atau objek File
  value?: File | string | null;
}

export function ImageUpload({ onChange, value }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    typeof value === "string" ? value : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/gif, image/webp"
      />
      {preview ? (
        <div className="relative group aspect-[16/9] w-full rounded-md overflow-hidden">
          <Image
            src={preview}
            alt="Pratinjau Gambar"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerFileSelect}
          className="aspect-[16/9] w-full rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
        >
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Klik untuk mengunggah gambar
          </p>
        </div>
      )}
    </div>
  );
}
