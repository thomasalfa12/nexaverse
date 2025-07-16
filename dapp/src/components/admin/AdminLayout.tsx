import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="p-8 max-w-6xl mx-auto space-y-12">{children}</div>;
}
