import VerifyProgressTable from "@/components/verify/VerifyProgressTable";

export default function VerifyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Verifikasi Institusi
        </h1>
        <p className="text-gray-600 text-sm">
          Silakan ikuti langkah-langkah berikut untuk memverifikasi institusi
          Anda dan mengklaim Soulbound Token (SBT).
        </p>
        <VerifyProgressTable />
      </div>
    </main>
  );
}
