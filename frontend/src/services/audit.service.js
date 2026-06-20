import api from "./api";

export const auditService = {
  list: async (params = {}) => {
    const res = await api.get("/audit-logs", { params });
    return res.data;
  },
};
