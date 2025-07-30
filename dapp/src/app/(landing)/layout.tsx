import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Menggunakan tema terang sebagai default untuk landing page baru
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
