import SideNav from "@/components/SideNav";
export default function DashboardAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SideNav>{children}</SideNav>;
}
