import api from "./api";

export const usersService = {
  list: async (params = {}) => {
    const res = await api.get("/users", { params });
    return res.data;
  },

  get: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/users", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },

  deactivate: async (id) => {
    await api.patch(`/users/${id}/deactivate`);
  },

  activate: async (id) => {
    await api.patch(`/users/${id}/activate`);
  },

  dropdown: async () => {
    const res = await api.get("/users/dropdown");
    return res.data;
  },
};
