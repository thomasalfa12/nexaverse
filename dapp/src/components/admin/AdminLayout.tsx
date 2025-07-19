// Langkah 1: Ganti seluruh isi file src/components/admin/AdminLayout.tsx
// dengan kode di bawah ini.

import { ReactNode } from "react";
import { Inbox, CheckSquare, FileText } from "lucide-react";

// Komponen internal untuk kartu statistik di header
const StatCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) => (
  <div className="bg-card p-4 rounded-xl border flex items-center gap-4">
    <div className="p-3 bg-primary/10 rounded-lg">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6">
      {/* Header Dasbor dengan KPI */}
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Dasbor Admin Registry
        </h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Anda bisa mengisi 'value' ini dengan data nyata nanti */}
          <StatCard title="Permintaan Baru" value="12" icon={Inbox} />
          <StatCard title="Institusi Terdaftar" value="84" icon={CheckSquare} />
          <StatCard title="Permintaan SBT" value="5" icon={FileText} />
        </div>
      </header>

      {/* Konten utama dari halaman */}
      <main className="space-y-12">{children}</main>
    </div>
  );
}
