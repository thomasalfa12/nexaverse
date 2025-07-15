import { useIsInstitutionStatus } from "@/lib/useIsInstitutionStatus";

export default function InstitutionDashboardPage() {
  const isInstitution = useIsInstitutionStatus();
  if (isInstitution === false) return <div>Access Denied</div>;
  if (isInstitution === null) return <div>Loading…</div>;

  return <div className="p-4">Halo, dashboard institusi.</div>;
}
