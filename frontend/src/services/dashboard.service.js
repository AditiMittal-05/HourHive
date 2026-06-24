import api from "./api";

export const dashboardService = {
  employee: async () => {
    const res = await api.get("/dashboard/employee");
    return res.data;
  },

  approver: async () => {
    const res = await api.get("/dashboard/approver");
    return res.data;
  },
};
