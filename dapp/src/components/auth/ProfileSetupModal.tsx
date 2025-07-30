"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createOrUpdateProfileAction } from "@/lib/server/actions/profileAction";

export function ProfileSetupModal({
  isOpen,
  onFinished,
}: {
  isOpen: boolean;
  onFinished: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createOrUpdateProfileAction(formData);
      if (result.success) {
        toast.success("Profil berhasil disimpan!");
        onFinished(); // Panggil ini untuk memberitahu provider agar menutup modal
      } else {
        toast.error("Gagal menyimpan profil", { description: result.error });
      }
    });
  };

  return (
    // `open={isOpen}` membuat modal ini terkontrol dari luar
    // `onOpenChange={() => {}}` mencegah modal ditutup dengan klik di luar
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selamat Datang!</DialogTitle>
          <DialogDescription>
            Lengkapi profil Anda untuk melanjutkan. Ini hanya akan muncul
            sekali.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Tampilan</Label>
            <Input
              id="name"
              name="name"
              required
              minLength={3}
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio (Opsional)</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Ceritakan sedikit tentang diri Anda..."
              disabled={isPending}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan & Lanjutkan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
