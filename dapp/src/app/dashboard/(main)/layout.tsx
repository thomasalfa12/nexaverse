import SideNav from "@/components/SideNav";
import { ProfileSetupProvider } from "@/components/auth/ProfileSetupProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileSetupProvider>
      <SideNav>{children}</SideNav>
    </ProfileSetupProvider>
  );
}
