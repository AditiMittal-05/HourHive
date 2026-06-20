import api from "./api";

export const dashboardService = {
  employee: async () => {
    const res = await api.get("/dashboard/employee");
    return res.data;
  },

  admin: async () => {
    const res = await api.get("/dashboard/admin");
    return res.data;
  },
};
