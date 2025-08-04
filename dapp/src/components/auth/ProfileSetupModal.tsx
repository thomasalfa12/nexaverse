"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  useForm,
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  User,
  Mail,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
} from "lucide-react";
import { createOrUpdateProfileAction } from "@/lib/server/actions/profileAction";
import { cn } from "@/lib/utils";

// Skema validasi tidak berubah
const profileSchema = z.object({
  image: z.string().url("URL gambar tidak valid.").optional(),
  name: z.string().min(3, "Nama Tampilan minimal 3 karakter.").trim(),
  email: z
    .string()
    .email("Format email tidak valid.")
    .optional()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Tipe props untuk komponen Step
interface StepProps {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  setValue: UseFormSetValue<ProfileFormData>;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
  imagePreview: string | null;
  watchedName: string;
}

// --- Komponen untuk setiap langkah ---

const Step1 = ({
  setValue,
  setImagePreview,
  imagePreview,
  watchedName,
}: Partial<StepProps>) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar", {
        description: "Gambar tidak boleh melebihi 1MB.",
      });
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Mengunggah gambar ke IPFS...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload gagal");
      }

      const data = await response.json();
      const ipfsUrl = data.ipfsUrl;

      const gatewayUrl = ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
      setImagePreview?.(gatewayUrl);
      setValue?.("image", ipfsUrl, { shouldValidate: true });

      toast.success("Gambar berhasil diunggah!", { id: toastId });
    } catch (error) {
      toast.error("Upload Gagal", {
        id: toastId,
        description: (error as Error).message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <motion.div
        key={imagePreview || "placeholder"}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-40 h-40"
      >
        <Image
          src={
            imagePreview ||
            `https://api.dicebear.com/8.x/shapes/svg?seed=${encodeURIComponent(
              watchedName!
            )}`
          }
          alt="Profile Preview"
          fill
          className="rounded-full object-cover border-4 border-blue-500/50 shadow-lg"
        />
      </motion.div>
      <p className="text-gray-400">
        Identitas unik untuk kreator unik.
        <br />
        Mulai dengan mengunggah foto Anda.
      </p>
      <div className="relative w-full p-8 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-lg hover:border-blue-400 transition-colors">
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-blue-400 font-semibold">
          Pilih file atau seret ke sini
        </p>
        <p className="text-xs text-gray-500">PNG, JPG, GIF hingga 1MB</p>
        <Input
          id="file-upload"
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept="image/*"
          disabled={isUploading}
        />
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <Loader2 className="animate-spin text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

const Step2 = ({ register, errors }: Partial<StepProps>) => (
  <div className="space-y-6">
    <div>
      <Label htmlFor="name" className="font-semibold text-gray-300">
        Nama Tampilan
      </Label>
      <div className="relative mt-2">
        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <Input
          id="name"
          {...register?.("name")}
          placeholder="Nama Unik Anda"
          className="h-12 text-base pl-12 bg-white/5 border-white/10 focus:ring-blue-400"
        />
      </div>
      {errors?.name && (
        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
      )}
    </div>
    <div>
      <Label htmlFor="email" className="font-semibold text-gray-300">
        Email (Opsional)
      </Label>
      <div className="relative mt-2">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <Input
          id="email"
          type="email"
          {...register?.("email")}
          placeholder="Untuk notifikasi & keamanan"
          className="h-12 text-base pl-12 bg-white/5 border-white/10 focus:ring-blue-400"
        />
      </div>
      {errors?.email && (
        <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
      )}
    </div>
  </div>
);

const Step3 = ({ watchedName, imagePreview }: Partial<StepProps>) => (
  <div className="flex flex-col items-center text-center space-y-4 py-8">
    <motion.div
      key={imagePreview || "placeholder-final"}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="relative w-32 h-32"
    >
      <Image
        src={
          imagePreview ||
          `https://api.dicebear.com/8.x/shapes/svg?seed=${encodeURIComponent(
            watchedName!
          )}`
        }
        alt="Profile Preview"
        fill
        className="rounded-full object-cover border-4 border-blue-500/50 shadow-lg"
      />
    </motion.div>
    <h3 className="text-2xl font-bold text-white">{watchedName}</h3>
    <p className="text-gray-400 max-w-xs">
      Identitas digital Anda siap ditempa. Setelah masuk, Anda akan membangun
      reputasi Anda secara on-chain.
    </p>
  </div>
);

// --- Komponen Modal Utama ---
export function ProfileSetupModal({
  isOpen,
  onFinished,
}: {
  isOpen: boolean;
  onFinished: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid, touchedFields },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
  });

  const watchedName = watch("name", "Creator Digital");

  // Add this at the end of your ProfileSetupModal component, in the onFormSubmit function:

  // Di ProfileSetupModal.tsx, ganti function onFormSubmit dengan yang ini:

  // Di ProfileSetupModal.tsx, ganti onFormSubmit dengan ini:

  const onFormSubmit = (data: ProfileFormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.image) formData.append("image", data.image);
    if (data.email) formData.append("email", data.email);

    console.log("MODAL: 📤 Mengirim data profil:", data);

    startTransition(async () => {
      try {
        console.log("MODAL: 💾 Memanggil createOrUpdateProfileAction...");
        const result = await createOrUpdateProfileAction(formData);

        console.log("MODAL: 📋 Result dari profileAction:", result);

        if (result.success) {
          console.log("MODAL: ✅ Profil berhasil disimpan ke database");
          toast.success("Selamat Datang di Nexaverse!");

          console.log("MODAL: 🚀 Memanggil onFinished untuk update session...");
          // Langsung panggil onFinished - let provider handle session update
          await onFinished();

          console.log("MODAL: 🎉 Proses setup profil selesai");
        } else {
          console.error("MODAL: ❌ Gagal menyimpan profil:", result.error);
          toast.error("Gagal menyimpan profil", { description: result.error });
        }
      } catch (error) {
        console.error(
          "MODAL: ❌ Error tidak terduga saat submit profil:",
          error
        );
        toast.error("Terjadi kesalahan yang tidak terduga");
      }
    });
  };
  const nextStep = async () => {
    let fieldsToValidate: (keyof ProfileFormData)[] = [];
    if (step === 2) {
      fieldsToValidate = ["name", "email"];
    }
    const isValidStep = await trigger(fieldsToValidate);
    if (isValidStep) {
      setStep((prev) => (prev < 3 ? prev + 1 : prev));
    }
  };
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  const steps = [
    { number: 1, title: "Foto Profil" },
    { number: 2, title: "Identitas Anda" },
    { number: 3, title: "Konfirmasi" },
  ];

  return (
    <Dialog open={isOpen}>
      <DialogOverlay className="bg-white/10 backdrop-blur-md" />
      <DialogContent
        className={cn(
          "max-w-md w-[95vw] h-auto max-h-[90vh] p-0 overflow-hidden",
          "bg-black border border-blue-900/50 text-gray-50 shadow-2xl rounded-2xl flex flex-col"
        )}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3 text-2xl font-bold text-white">
              <Sparkles className="text-blue-400 h-7 w-7" />
              <DialogTitle>Buat Profil Anda</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {steps.map((s) => (
                <div
                  key={s.number}
                  className={cn(
                    "h-2 w-8 rounded-full transition-colors",
                    step >= s.number ? "bg-blue-500" : "bg-gray-700"
                  )}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <Step1
                  setValue={setValue}
                  setImagePreview={setImagePreview}
                  imagePreview={imagePreview}
                  watchedName={watchedName}
                />
              )}
              {step === 2 && <Step2 register={register} errors={errors} />}
              {step === 3 && (
                <Step3 watchedName={watchedName} imagePreview={imagePreview} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between p-6 bg-gray-900/50 border-t border-white/10 mt-auto">
          <Button variant="ghost" onClick={prevStep} disabled={step === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>

          {step < 3 ? (
            <Button
              onClick={nextStep}
              disabled={step === 2 && (!touchedFields.name || !!errors.name)}
            >
              Lanjut <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit(onFormSubmit)}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isPending || !isValid}
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Selesaikan & Masuk <CheckCircle className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
