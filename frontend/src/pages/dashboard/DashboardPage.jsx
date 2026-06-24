import { useAuthStore } from "@/store/auth.store";
import { EmployeeDashboard } from "./EmployeeDashboard";
import { SuperAdminDashboard } from "./SuperAdminDashboard";

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  if (user?.role === "super_admin") return <SuperAdminDashboard />;
  if (user?.can_approve_timesheets) return <SuperAdminDashboard />;
  return <EmployeeDashboard />;
}
