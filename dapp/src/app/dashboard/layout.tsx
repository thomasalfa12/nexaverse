// app/dashboard/layout.tsx (UPDATED)
import SideNav from "@/components/SideNav";

// Providers dan metadata bisa Anda pindahkan ke root layout di app/layout.tsx
// agar tidak perlu di-import berulang kali di setiap sub-layout.
// Namun, jika ini khusus untuk dashboard, biarkan saja.

export default function DashboardAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Komponen SideNav sekarang membungkus semua halaman di dalam /dashboard
  // dan menyediakan sidebar, header, serta area konten utama.
  return <SideNav>{children}</SideNav>;
}
