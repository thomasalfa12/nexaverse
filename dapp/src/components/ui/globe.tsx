// components/ui/globe.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { GlobeMethods } from "react-globe.gl";

// Dynamic import untuk Globe dari react-globe.gl
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

// Tipe untuk konfigurasi globe yang diterima dari props
export type GlobeConfig = {
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  arcTime?: number;
  arcLength?: number;
  autoRotateSpeed?: number;
};

// Tipe untuk data arcs
type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

// Tipe untuk props komponen World
interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
}

export function World({ globeConfig, data }: WorldProps) {
  const globeEl = React.useRef<GlobeMethods | undefined>();

  React.useEffect(() => {
    const globe = globeEl.current;
    if (globe) {
      // Atur konfigurasi kamera dan kontrol
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = globeConfig.autoRotateSpeed || 0.9;
      globe.controls().enableZoom = false; // Menonaktifkan zoom
      globe.pointOfView({ lat: 20.0, lng: 100.0, altitude: 2.5 }); // Posisi awal kamera
    }
  }, [globeEl, globeConfig.autoRotateSpeed]);

  return (
    <Globe
      ref={globeEl}
      backgroundColor="rgba(0,0,0,0)"
      // Menggunakan tekstur bumi malam hari. Ini sudah cukup untuk visual daratan.
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      // Konfigurasi atmosfer dari props
      showAtmosphere={globeConfig.showAtmosphere}
      atmosphereColor={globeConfig.atmosphereColor}
      atmosphereAltitude={globeConfig.atmosphereAltitude}
      // FIX: HAPUS SEMUA PROPERTI TERKAIT POLYGON
      // Ini akan mencegah daratan putih menutupi tekstur globe.

      // Konfigurasi garis melengkung (arcs)
      arcsData={data}
      arcColor={"color"}
      arcAltitude={"arcAlt"}
      arcDashLength={() => globeConfig.arcLength || 0.9}
      arcDashGap={15}
      arcDashAnimateTime={() => globeConfig.arcTime || 1000}
    />
  );
}
