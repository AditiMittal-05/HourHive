import { useAuthStore } from "@/store/auth.store";
import { EmployeeDashboard } from "./EmployeeDashboard";
import { AdminDashboard } from "./AdminDashboard";
import { SuperAdminDashboard } from "./SuperAdminDashboard";

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  if (user?.role === "super_admin") return <SuperAdminDashboard />;
  if (user?.role === "admin") return <AdminDashboard />;
  return <EmployeeDashboard />;
}
