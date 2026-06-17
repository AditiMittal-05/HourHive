import api from "./api";
import type { LoginRequest, TokenResponse, AuthUser } from "@/types";

export const authService = {
  register: async (data: { full_name: string; email: string; password: string; confirm_password: string }): Promise<TokenResponse> => {
    const res = await api.post<TokenResponse>("/auth/register", data);
    return res.data;
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await api.post<TokenResponse>("/auth/login", data);
    return res.data;
  },

  refresh: async (refreshToken: string): Promise<TokenResponse> => {
    const res = await api.post<TokenResponse>("/auth/refresh", { refresh_token: refreshToken });
    return res.data;
  },

  me: async (): Promise<AuthUser> => {
    const res = await api.get<AuthUser>("/auth/me");
    return res.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token: string, new_password: string): Promise<void> => {
    await api.post("/auth/reset-password", { token, new_password });
  },

  changePassword: async (old_password: string, new_password: string): Promise<void> => {
    await api.post("/auth/change-password", { old_password, new_password });
  },
};
