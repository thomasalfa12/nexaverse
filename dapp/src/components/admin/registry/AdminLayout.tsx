// File: src/components/admin/AdminLayout.tsx

import { ReactNode } from "react";
import { Inbox, CheckSquare, FileText, Loader2 } from "lucide-react";

// Tipe data baru untuk props statistik
export interface AdminStats {
  pendingCount: number;
  registeredCount: number;
  sbtRequestCount: number;
}

// Komponen internal untuk kartu statistik di header
const StatCard = ({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  isLoading?: boolean;
}) => (
  <div className="bg-card p-4 rounded-xl border flex items-center gap-4">
    <div className="p-3 bg-primary/10 rounded-lg">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      {/* Tampilkan loader jika data sedang dimuat, jika tidak tampilkan nilainya */}
      <div className="text-2xl font-bold h-8 flex items-center">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          value
        )}
      </div>
    </div>
  </div>
);

// Komponen AdminLayout yang telah direfactor
export default function AdminLayout({
  children,
  stats,
  isLoading,
}: {
  children: ReactNode;
  stats: AdminStats;
  isLoading?: boolean; // Tambahkan prop isLoading
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6">
      {/* Header Dasbor dengan KPI */}
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Dasbor Admin Registry
        </h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Menggunakan nilai dinamis dari props `stats` */}
          <StatCard
            title="Permintaan Baru"
            value={stats.pendingCount}
            icon={Inbox}
            isLoading={isLoading}
          />
          <StatCard
            title="Entitas Terverifikasi"
            value={stats.registeredCount}
            icon={CheckSquare}
            isLoading={isLoading}
          />
          <StatCard
            title="Permintaan Lencana"
            value={stats.sbtRequestCount}
            icon={FileText}
            isLoading={isLoading}
          />
        </div>
      </header>

      {/* Konten utama dari halaman */}
      <main className="space-y-12">{children}</main>
    </div>
  );
}
