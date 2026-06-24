import api from "./api";

export const holidayService = {
  list: async (year) => {
    const res = await api.get("/holidays", { params: { year } });
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/holidays", data);
    return res.data;
  },

  delete: async (id) => {
    await api.delete(`/holidays/${id}`);
  },

  uploadPdf: async (year, file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post(`/holidays/upload-pdf/${year}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};
