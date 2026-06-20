import api from "./api";

export const reportsService = {
  daily: async (params) => {
    const res = await api.get("/reports/daily", { params });
    return res.data;
  },

  monthlySummary: async (params) => {
    const res = await api.get("/reports/monthly-summary", { params });
    return res.data;
  },

  projectEffort: async (params) => {
    const res = await api.get("/reports/project-effort", { params });
    return res.data;
  },

  activity: async (params) => {
    const res = await api.get("/reports/activity", { params });
    return res.data;
  },

  missingTimesheets: async (params) => {
    const res = await api.get("/reports/missing-timesheets", { params });
    return res.data;
  },

  comparison: async (params) => {
    const res = await api.get("/reports/comparison", { params });
    return res.data;
  },

  exportDaily: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && searchParams.set(k, String(v)));
    return `/api/v1/reports/export/daily?${searchParams.toString()}`;
  },
};
