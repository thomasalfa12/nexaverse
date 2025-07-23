// File: app/dashboard/verifiedUser/_components/TemplateListView.tsx
"use client";

import type { CredentialTemplate } from "@prisma/client";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, Award, Users, PlusCircle } from "lucide-react";

// Tipe data diperluas untuk menyertakan statistik dari API
export type TemplateWithStats = CredentialTemplate & {
  _count: {
    eligibilityList: number;
    issuedCredentials: number;
  };
};

// --- FUNGSI HELPER BARU ---
// Fungsi ini menerjemahkan URI IPFS menjadi URL Gateway HTTPS yang bisa dibaca browser.
const toGatewayURL = (ipfsUri: string) => {
  if (ipfsUri && ipfsUri.startsWith("ipfs://")) {
    // Ganti prefix `ipfs://` dengan URL gateway publik
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  // Kembalikan URL asli jika formatnya tidak dikenali\
  return ipfsUri;
};
const StatCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {/* FIX: Pastikan value adalah number valid, jika tidak tampilkan 0 */}
      <div className="text-2xl font-bold">{isNaN(value) ? 0 : value}</div>
    </CardContent>
  </Card>
);

const TemplateCard = ({
  template,
  onSelect,
}: {
  template: TemplateWithStats;
  onSelect: () => void;
}) => (
  <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
    <div className="aspect-[16/9] bg-muted rounded-t-lg overflow-hidden relative">
      {/* FIX: Menggunakan komponen <Image> dari Next.js untuk optimasi */}
      <Image
        src={toGatewayURL(template.imageUrl)}
        alt={template.title}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        // FIX: Tambahkan onError handler untuk fallback
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/placeholder-image.png"; // Ganti dengan path gambar default Anda
        }}
      />
    </div>
    <div className="p-4">
      <h3 className="font-semibold truncate">{template.title}</h3>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        {/* FIX: Pastikan nilai tidak NaN */}
        <span>Eligible: {template._count?.eligibilityList || 0}</span>
        <span>Terklaim: {template._count?.issuedCredentials || 0}</span>
      </div>
      <Button className="w-full mt-4" onClick={onSelect}>
        Kelola
      </Button>
    </div>
  </div>
);

interface TemplateListViewProps {
  templates: TemplateWithStats[];
  onSelectTemplate: (template: TemplateWithStats) => void;
  onCreateClick: () => void;
}

export function TemplateListView({
  templates,
  onSelectTemplate,
  onCreateClick,
}: TemplateListViewProps) {
  // FIX: Pastikan templates adalah array dan handle nilai yang tidak valid
  const safeTemplates = templates || [];
  const totalTemplates = safeTemplates.length;

  // FIX: Handle kasus di mana _count mungkin undefined dan pastikan hasilnya valid
  const totalIssued = safeTemplates.reduce((sum, t) => {
    const issued = t._count?.issuedCredentials || 0;
    return sum + (isNaN(issued) ? 0 : issued);
  }, 0);

  const totalEligible = safeTemplates.reduce((sum, t) => {
    const eligible = t._count?.eligibilityList || 0;
    return sum + (isNaN(eligible) ? 0 : eligible);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header & Statistik */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dasbor Kredensial
          </h1>
          <p className="text-muted-foreground">
            Buat dan kelola kredensial untuk komunitas Anda.
          </p>
        </div>
        <Button onClick={onCreateClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Buat Templat Baru
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Templat"
          value={totalTemplates}
          icon={LayoutTemplate}
        />
        <StatCard title="Total Terbit" value={totalIssued} icon={Award} />
        <StatCard title="Total Eligible" value={totalEligible} icon={Users} />
      </div>

      {/* Galeri Templat */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Templat Anda</h2>
        {safeTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {safeTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onSelectTemplate(template)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6 border-2 border-dashed rounded-xl bg-gray-50">
            <h3 className="text-lg font-semibold">
              Anda belum memiliki templat.
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Klik &quot;Buat Templat Baru&quot; untuk memulai.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
