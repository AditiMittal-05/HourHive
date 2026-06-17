import api from "./api";
import type { Activity, ActivityCreate, ActivityUpdate, PaginatedResponse } from "@/types";

export const activitiesService = {
  list: async (params: { search?: string; page?: number; page_size?: number } = {}): Promise<PaginatedResponse<Activity>> => {
    const res = await api.get<PaginatedResponse<Activity>>("/activities", { params });
    return res.data;
  },

  active: async (): Promise<Activity[]> => {
    const res = await api.get<Activity[]>("/activities/active");
    return res.data;
  },

  get: async (id: number): Promise<Activity> => {
    const res = await api.get<Activity>(`/activities/${id}`);
    return res.data;
  },

  create: async (data: ActivityCreate): Promise<Activity> => {
    const res = await api.post<Activity>("/activities", data);
    return res.data;
  },

  update: async (id: number, data: ActivityUpdate): Promise<Activity> => {
    const res = await api.put<Activity>(`/activities/${id}`, data);
    return res.data;
  },

  deactivate: async (id: number): Promise<void> => {
    await api.patch(`/activities/${id}/deactivate`);
  },

  activate: async (id: number): Promise<void> => {
    await api.patch(`/activities/${id}/activate`);
  },
};
