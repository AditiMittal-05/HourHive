import api from "./api";
import type { User, UserCreate, UserUpdate, UserDropdown, PaginatedResponse } from "@/types";

interface ListParams {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

export const usersService = {
  list: async (params: ListParams = {}): Promise<PaginatedResponse<User>> => {
    const res = await api.get<PaginatedResponse<User>>("/users", { params });
    return res.data;
  },

  get: async (id: number): Promise<User> => {
    const res = await api.get<User>(`/users/${id}`);
    return res.data;
  },

  create: async (data: UserCreate): Promise<User> => {
    const res = await api.post<User>("/users", data);
    return res.data;
  },

  update: async (id: number, data: UserUpdate): Promise<User> => {
    const res = await api.put<User>(`/users/${id}`, data);
    return res.data;
  },

  deactivate: async (id: number): Promise<void> => {
    await api.patch(`/users/${id}/deactivate`);
  },

  activate: async (id: number): Promise<void> => {
    await api.patch(`/users/${id}/activate`);
  },

  dropdown: async (): Promise<UserDropdown[]> => {
    const res = await api.get<UserDropdown[]>("/users/dropdown");
    return res.data;
  },
};
