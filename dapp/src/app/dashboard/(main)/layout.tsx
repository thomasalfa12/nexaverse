// src/app/dashboard/layout.tsx

// --- Impor komponen-komponen yang dibutuhkan ---
import { RouteGuard } from "@/components/auth/AuthProviders";
import SideNav from "@/components/SideNav";

/**
 * Layout utama untuk seluruh area dashboard.
 * - Dibungkus dengan RouteGuard untuk memastikan hanya pengguna terotentikasi yang bisa masuk.
 * - Menggunakan komponen SideNav untuk struktur visual (sidebar, header, dll).
 */
export default function DashboardAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <SideNav>{children}</SideNav>
    </RouteGuard>
  );
}
