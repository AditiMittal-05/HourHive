import { useAuthStore } from "@/store/auth.store";
import { EmployeeDashboard } from "./EmployeeDashboard";
import { AdminDashboard } from "./AdminDashboard";

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  return user?.role === "admin" ? <AdminDashboard /> : <EmployeeDashboard />;
}
