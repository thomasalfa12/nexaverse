import VerifyProgressTable from "@/components/verify/VerifyProgressTable";

export default function VerifyPage() {
  return (
    // PERBAIKAN: Menghapus kelas warna hardcoded dari <main>
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-4">
        {/* PERBAIKAN: Mengganti text-gray-900 dengan text-foreground */}
        <h1 className="text-3xl font-bold text-foreground">
          Verifikasi Entitas
        </h1>
        {/* PERBAIKAN: Mengganti text-gray-600 dengan text-muted-foreground */}
        <p className="text-muted-foreground text-sm">
          Silakan ikuti langkah-langkah berikut untuk memverifikasi entitas Anda
          dan mengklaim Soulbound Token (SBT).
        </p>
        <VerifyProgressTable />
      </div>
    </main>
  );
}
