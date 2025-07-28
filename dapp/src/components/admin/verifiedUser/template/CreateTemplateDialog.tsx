"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Papa, { type ParseResult } from "papaparse";
import { isAddress } from "viem";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  UploadCloud,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  FileText,
  CheckCircle,
  Search,
  AlertCircle,
  Info,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateTemplate } from "@/hooks/useCreateTemplate";

const formSchema = z.object({
  title: z
    .string()
    .min(3, "Judul minimal 3 karakter.")
    .max(100, "Judul maksimal 100 karakter."),
  symbol: z
    .string()
    .min(3, "Simbol minimal 3 karakter.")
    .max(10, "Simbol maksimal 10 karakter.")
    .regex(/^[A-Z0-9-_]+$/, "Simbol hanya boleh huruf besar, angka, - dan _"),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter.")
    .max(1000, "Deskripsi maksimal 1000 karakter."),
  image: z
    .instanceof(File, { message: "Gambar wajib diisi." })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Ukuran gambar maksimal 5MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Format gambar harus JPG, PNG, atau WebP"
    ),
  addresses: z
    .string()
    .min(42, "Setidaknya satu alamat wallet valid diperlukan."),
  distributionMethod: z.enum(["claim", "airdrop"]),
});

type FormData = z.infer<typeof formSchema>;

function Step1_CredentialDetails({
  form,
}: {
  form: ReturnType<typeof useForm<FormData>>;
}) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  return (
    <div className="grid gap-6 py-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Isi detail kredensial yang akan dibuat. Pastikan informasi akurat
          karena tidak dapat diubah setelah di-deploy.
        </AlertDescription>
      </Alert>

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <Label>Judul Kredensial *</Label>
            <FormControl>
              <Input
                placeholder="Contoh: Peserta Webinar Solidity Fundamentals"
                {...field}
                maxLength={100}
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              {field.value?.length || 0}/100 karakter
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="symbol"
        render={({ field }) => (
          <FormItem>
            <Label>Simbol Token *</Label>
            <FormControl>
              <Input
                placeholder="Contoh: SOLIDITY-WEB"
                {...field}
                maxLength={10}
                style={{ textTransform: "uppercase" }}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              Hanya huruf besar, angka, - dan _ • {field.value?.length || 0}/10
              karakter
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <Label>Deskripsi *</Label>
            <FormControl>
              <Textarea
                placeholder="Jelaskan apa yang dicapai pemegang kredensial ini..."
                rows={4}
                maxLength={1000}
                {...field}
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              {field.value?.length || 0}/1000 karakter
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <Label>Gambar Kredensial *</Label>
            <div className="flex items-start gap-4">
              <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 relative border-2 border-dashed border-muted-foreground/25">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Pratinjau"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Preview</p>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file size
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("Ukuran file terlalu besar (maksimal 5MB)");
                        return;
                      }

                      field.onChange(file);
                      const url = URL.createObjectURL(file);
                      setImagePreview(url);

                      // Cleanup previous URL
                      return () => URL.revokeObjectURL(url);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                  className="w-full"
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {field.value ? "Ganti Gambar" : "Pilih Gambar"}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Format: JPG, PNG, WebP • Maksimal 5MB
                </p>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function Step2_RecipientList({
  form,
}: {
  form: ReturnType<typeof useForm<FormData>>;
}) {
  const [validAddresses, setValidAddresses] = useState<string[]>([]);
  const [invalidAddresses, setInvalidAddresses] = useState<string[]>([]);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const csvInputRef = useRef<HTMLInputElement>(null);

  const processAddressList = (addrList: string[]) => {
    const processed = addrList
      .map((addr) => addr.trim().toLowerCase())
      .filter(Boolean);

    const valid = processed.filter((addr) => isAddress(addr));
    const invalid = processed.filter(
      (addr) => !isAddress(addr) && addr.length > 0
    );

    // Remove duplicates
    const uniqueValid = [...new Set(valid)];
    const uniqueInvalid = [...new Set(invalid)];

    setValidAddresses(uniqueValid);
    setInvalidAddresses(uniqueInvalid);

    form.setValue("addresses", uniqueValid.join("\n"), {
      shouldValidate: true,
    });

    if (uniqueValid.length > 0) {
      toast.success(`${uniqueValid.length} alamat valid ditemukan.`);
    }
    if (uniqueInvalid.length > 0) {
      toast.warning(`${uniqueInvalid.length} alamat tidak valid diabaikan.`);
    }
  };

  const handleManualPaste = (text: string) => {
    const addresses = text.split(/[\n,;|\s]+/).filter(Boolean);
    processAddressList(addresses);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast.error("File terlalu besar (maksimal 10MB)");
      return;
    }

    Papa.parse<string[]>(file, {
      complete: (results: ParseResult<string[]>) => {
        try {
          const allValues = results.data
            .flat()
            .filter(Boolean)
            .map((val) => String(val).trim());

          if (allValues.length === 0) {
            toast.error("File CSV kosong atau tidak valid");
            return;
          }

          processAddressList(allValues);
          toast.success(
            `File berhasil diproses: ${allValues.length} entri ditemukan`
          );
        } catch (error) {
          toast.error("Gagal memproses file CSV");
          console.log("CSv parsing error:", error);
        }
      },
      error: (err: Error) => {
        toast.error("Gagal membaca file CSV", {
          description: err.message,
        });
      },
      skipEmptyLines: true,
      dynamicTyping: false,
    });
  };

  const handleSnapshot = async () => {
    if (!isAddress(contractAddress)) {
      toast.error("Alamat kontrak tidak valid.");
      return;
    }

    setSnapshotLoading(true);

    try {
      const res = await fetch(`/api/snapshot/${contractAddress}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengambil snapshot.");
      }

      if (!data.holders || !Array.isArray(data.holders)) {
        throw new Error("Format response tidak valid");
      }

      processAddressList(data.holders);
      toast.success(
        `Snapshot berhasil: ${data.holders.length} holder ditemukan`
      );
    } catch (error) {
      console.error("Snapshot error:", error);
      toast.error("Gagal mengambil snapshot", {
        description: (error as Error).message,
      });
    } finally {
      setSnapshotLoading(false);
    }
  };

  return (
    <div className="grid gap-6 py-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Tambahkan daftar alamat wallet yang akan menerima kredensial. Alamat
          akan otomatis dikonversi ke lowercase untuk konsistensi.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual">Input Manual</TabsTrigger>
          <TabsTrigger value="csv">Unggah CSV</TabsTrigger>
          <TabsTrigger value="snapshot">Snapshot Kontrak</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="pt-4">
          <FormField
            control={form.control}
            name="addresses"
            render={({ field }) => (
              <FormItem>
                <Label>Daftar Alamat Wallet Penerima *</Label>
                <FormControl>
                  <Textarea
                    placeholder="0x1234...&#10;0x5678...&#10;&#10;Satu alamat per baris, bisa juga dipisah koma, semicolon, atau spasi"
                    rows={10}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleManualPaste(e.target.value);
                    }}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Mendukung pemisah: enter, koma, semicolon, atau spasi
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>

        <TabsContent value="csv" className="pt-4">
          <div className="text-center py-8 px-6 border-2 border-dashed rounded-xl bg-muted/10">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Unggah file CSV berisi alamat wallet (satu kolom atau baris)
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Maksimal 10MB • Format: .csv
            </p>
            <Input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => csvInputRef.current?.click()}
            >
              <FileText className="mr-2 h-4 w-4" /> Pilih File CSV
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="snapshot" className="pt-4">
          <div className="space-y-4">
            <div>
              <Label>Alamat Kontrak ERC721/ERC1155</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="0x..."
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleSnapshot}
                  disabled={snapshotLoading || !contractAddress}
                  variant="outline"
                >
                  {snapshotLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {snapshotLoading ? "Loading..." : "Ambil"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Mengambil semua pemegang token dari kontrak NFT sebagai daftar
                penerima
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Address Summary */}
      {(validAddresses.length > 0 || invalidAddresses.length > 0) && (
        <div className="space-y-3">
          {validAddresses.length > 0 && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {validAddresses.length} alamat valid siap diproses
              </p>
              {validAddresses.length > 5 && (
                <p className="text-xs text-emerald-600 mt-1">
                  Preview: {validAddresses.slice(0, 3).join(", ")}... dan{" "}
                  {validAddresses.length - 3} lainnya
                </p>
              )}
            </div>
          )}

          {invalidAddresses.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {invalidAddresses.length} alamat tidak valid diabaikan
              </p>
              {invalidAddresses.length <= 5 ? (
                <p className="text-xs text-amber-600 mt-1">
                  {invalidAddresses.join(", ")}
                </p>
              ) : (
                <p className="text-xs text-amber-600 mt-1">
                  {invalidAddresses.slice(0, 3).join(", ")}... dan{" "}
                  {invalidAddresses.length - 3} lainnya
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <FormField
        control={form.control}
        name="distributionMethod"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <Label>Metode Distribusi *</Label>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid gap-4"
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="claim" id="claim" className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor="claim"
                      className="font-medium cursor-pointer"
                    >
                      Buat Daftar Klaim (Recommended)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pengguna mengklaim kredensial sendiri menggunakan Merkle
                      Tree. Lebih hemat gas dan memberikan kontrol kepada
                      penerima.
                    </p>
                    <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Gas efficient • User controlled • Scalable
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem
                    value="airdrop"
                    id="airdrop"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="airdrop"
                      className="font-medium cursor-pointer"
                    >
                      Kirim Langsung (Airdrop)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Kredensial langsung dikirim ke semua alamat dalam satu
                      transaksi batch. Memerlukan gas fee yang lebih tinggi.
                    </p>
                    <div className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Higher gas cost • Immediate delivery • Batch limit: 100
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function CreateTemplateDialog({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(1);
  const { createTemplate, isLoading, resetState } = useCreateTemplate({
    onSuccess: () => {
      onSuccess();
      handleClose();
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      symbol: "",
      description: "",
      image: undefined,
      addresses: "",
      distributionMethod: "claim",
    },
    mode: "onChange",
  });

  const onSubmit = (values: FormData) => {
    // Parse addresses from textarea
    const addresses = values.addresses
      .split(/[\n,;|\s]+/)
      .map((addr) => addr.trim().toLowerCase())
      .filter((addr) => addr && isAddress(addr));

    if (addresses.length === 0) {
      toast.error("Tidak ada alamat valid ditemukan");
      return;
    }

    // Check batch limit for airdrop
    if (values.distributionMethod === "airdrop" && addresses.length > 100) {
      toast.error("Airdrop dibatasi maksimal 100 alamat per batch", {
        description:
          "Gunakan metode 'Daftar Klaim' untuk jumlah penerima lebih banyak.",
      });
      return;
    }

    // Create template with processed addresses
    createTemplate({
      ...values,
      addresses,
    });
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      setStep(1);
      resetState();
      onClose();
    }
  };

  const nextStep = async () => {
    const isValid = await form.trigger([
      "title",
      "symbol",
      "description",
      "image",
    ]);
    if (isValid) {
      setStep(2);
    } else {
      toast.error("Lengkapi semua field yang diperlukan");
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  // Get current addresses count for validation
  const currentAddresses =
    form
      .watch("addresses")
      ?.split(/[\n,;|\s]+/)
      .map((addr) => addr.trim().toLowerCase())
      .filter((addr) => addr && isAddress(addr)) || [];

  const distributionMethod = form.watch("distributionMethod");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Terbitkan Kredensial Sederhana
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            Langkah {step} dari 2:{" "}
            {step === 1 ? "Detail Kredensial" : "Konfigurasi Distribusi"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
            <div className="min-h-[400px]">
              {step === 1 && <Step1_CredentialDetails form={form} />}
              {step === 2 && <Step2_RecipientList form={form} />}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-6 border-t">
              {step === 2 && currentAddresses.length > 0 && (
                <div className="flex-1 text-sm text-muted-foreground">
                  {currentAddresses.length} alamat siap • Metode:{" "}
                  {distributionMethod === "claim" ? "Daftar Klaim" : "Airdrop"}
                  {distributionMethod === "airdrop" &&
                    currentAddresses.length > 100 && (
                      <span className="text-amber-600 font-medium">
                        {" "}
                        • Melebihi batas airdrop (100)
                      </span>
                    )}
                </div>
              )}

              <div className="flex gap-2">
                {step === 1 && (
                  <>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isLoading}
                      >
                        Batal
                      </Button>
                    </DialogClose>
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={isLoading}
                    >
                      Selanjutnya
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={isLoading}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali
                    </Button>

                    <Button
                      type="submit"
                      disabled={
                        isLoading ||
                        currentAddresses.length === 0 ||
                        (distributionMethod === "airdrop" &&
                          currentAddresses.length > 100)
                      }
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Deploy & Proses
                          {distributionMethod === "airdrop" && (
                            <span className="ml-1 text-xs">
                              ({currentAddresses.length} alamat)
                            </span>
                          )}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
