import api from "./api";

export const projectsService = {
  list: async (params = {}) => {
    const res = await api.get("/projects", { params });
    return res.data;
  },

  get: async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/projects", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  },

  deactivate: async (id) => {
    await api.patch(`/projects/${id}/deactivate`);
  },

  dropdown: async () => {
    const res = await api.get("/projects/dropdown");
    return res.data;
  },
};
