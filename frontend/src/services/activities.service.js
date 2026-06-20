import api from "./api";

export const activitiesService = {
  list: async (params = {}) => {
    const res = await api.get("/activities", { params });
    return res.data;
  },

  active: async () => {
    const res = await api.get("/activities/active");
    return res.data;
  },

  get: async (id) => {
    const res = await api.get(`/activities/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/activities", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/activities/${id}`, data);
    return res.data;
  },

  deactivate: async (id) => {
    await api.patch(`/activities/${id}/deactivate`);
  },

  activate: async (id) => {
    await api.patch(`/activities/${id}/activate`);
  },
};
