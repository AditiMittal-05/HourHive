import api from "./api";

export const timesheetsService = {
  weeklyGrid: async (weekStart) => {
    const res = await api.get("/timesheets/weekly", { params: { week_start: weekStart } });
    return res.data;
  },

  dailyEntries: async (workDate) => {
    const res = await api.get("/timesheets/daily", { params: { work_date: workDate } });
    return res.data;
  },

  addEntry: async (data) => {
    const res = await api.post("/timesheets/entries", data);
    return res.data;
  },

  updateEntry: async (id, data) => {
    const res = await api.put(`/timesheets/entries/${id}`, data);
    return res.data;
  },

  deleteEntry: async (id) => {
    await api.delete(`/timesheets/entries/${id}`);
  },

  copyDay: async (data) => {
    const res = await api.post("/timesheets/copy-day", data);
    return res.data;
  },

  submitTimesheet: async (headerId) => {
    const res = await api.post(`/timesheets/headers/${headerId}/submit`);
    return res.data;
  },

  listTimesheets: async (params = {}) => {
    const res = await api.get("/timesheets/headers", { params });
    return res.data;
  },
};
