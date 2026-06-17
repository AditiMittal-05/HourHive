import api from "./api";
import type { Project, ProjectCreate, ProjectUpdate, ProjectDropdown, PaginatedResponse } from "@/types";

export const projectsService = {
  list: async (params: { search?: string; status?: string; page?: number; page_size?: number } = {}): Promise<PaginatedResponse<Project>> => {
    const res = await api.get<PaginatedResponse<Project>>("/projects", { params });
    return res.data;
  },

  get: async (id: number): Promise<Project> => {
    const res = await api.get<Project>(`/projects/${id}`);
    return res.data;
  },

  create: async (data: ProjectCreate): Promise<Project> => {
    const res = await api.post<Project>("/projects", data);
    return res.data;
  },

  update: async (id: number, data: ProjectUpdate): Promise<Project> => {
    const res = await api.put<Project>(`/projects/${id}`, data);
    return res.data;
  },

  deactivate: async (id: number): Promise<void> => {
    await api.patch(`/projects/${id}/deactivate`);
  },

  dropdown: async (): Promise<ProjectDropdown[]> => {
    const res = await api.get<ProjectDropdown[]>("/projects/dropdown");
    return res.data;
  },
};
