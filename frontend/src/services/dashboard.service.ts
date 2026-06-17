import api from "./api";
import type { EmployeeDashboard, AdminDashboard } from "@/types";

export const dashboardService = {
  employee: async (): Promise<EmployeeDashboard> => {
    const res = await api.get<EmployeeDashboard>("/dashboard/employee");
    return res.data;
  },

  admin: async (): Promise<AdminDashboard> => {
    const res = await api.get<AdminDashboard>("/dashboard/admin");
    return res.data;
  },
};
