// src/app/dashboard/(main)/layout.tsx

import { RouteGuard } from "@/components/auth/AuthProviders";
import SideNav from "@/components/SideNav";
// 1. Impor provider baru Anda
import { ProfileSetupProvider } from "@/components/auth/ProfileSetupProvider";

export default function DashboardAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      {/* 2. Bungkus SideNav dan children dengan ProfileSetupProvider */}
      <ProfileSetupProvider>
        <SideNav>{children}</SideNav>
      </ProfileSetupProvider>
    </RouteGuard>
  );
}
