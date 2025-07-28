"use client";

import type { TemplateWithStats } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BookText, Users, Award } from "lucide-react";

const toGatewayURL = (ipfsUri: string) => {
  if (ipfsUri && ipfsUri.startsWith("ipfs://"))
    return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  return ipfsUri;
};

const TemplateCard = ({
  template,
  onSelect,
}: {
  template: TemplateWithStats;
  onSelect: () => void;
}) => (
  <div className="border rounded-lg bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
    <div className="aspect-[16/9] bg-muted rounded-t-lg overflow-hidden relative">
      <Image
        src={toGatewayURL(template.imageUrl)}
        alt={template.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = `https://placehold.co/600x400/EEE/31343C?text=Image+Error`;
        }}
      />
    </div>
    <div className="p-4 flex flex-col h-[150px]">
      <h3 className="font-semibold truncate flex-grow" title={template.title}>
        {template.title}
      </h3>
      <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" /> {template._count?.eligibilityList || 0}{" "}
          Eligible
        </div>
        <div className="flex items-center gap-1">
          <Award className="h-3 w-3" />{" "}
          {template._count?.issuedCredentials || 0} Terklaim
        </div>
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
  emptyStateMessage: string;
  // FIX: Menambahkan prop `onCreateClick` yang hilang.
  onCreateClick: () => void;
}

export function TemplateListView({
  templates,
  onSelectTemplate,
  emptyStateMessage,
  onCreateClick,
}: TemplateListViewProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-16 px-6 border-2 border-dashed rounded-xl mt-4">
        <BookText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Tidak Ada Apapun Di Sini</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {emptyStateMessage}
        </p>
        <Button onClick={onCreateClick} className="mt-4">
          Buat yang Pertama
        </Button>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onSelect={() => onSelectTemplate(template)}
        />
      ))}
    </div>
  );
}
