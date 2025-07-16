import type { ReactNode } from "react";
import SideNav from "@/components/SideNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SideNav />
      <div className="pt-16 sm:ml-64">
        <div className="p-4 max-w-4xl mx-auto">{children}</div>
      </div>
    </>
  );
}
