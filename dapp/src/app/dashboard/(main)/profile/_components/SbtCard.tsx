// File: app/dashboard/(main)/profile/_components/SbtCard.tsx
"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SbtWithIssuer } from "../page";
import { resolveIpfsUrl } from "@/utils/pinata";

export const SbtCard = ({ sbt }: { sbt: SbtWithIssuer }) => {
  return (
    <Card className="relative overflow-hidden group bg-slate-900 border border-slate-800 transition-all duration-300 hover:border-slate-700 hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="aspect-square bg-slate-800 relative overflow-hidden">
          <Image
            src={resolveIpfsUrl(sbt.imageUrl)}
            alt={sbt.title}
            fill
            className="object-cover transition-all duration-300 group-hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-slate-100 truncate">
          {sbt.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 truncate">
          {sbt.issuer.name}
        </p>
      </CardContent>
    </Card>
  );
};
