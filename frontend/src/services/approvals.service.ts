import api from "./api";
import type { TimesheetHeader, ApprovalHistory, PaginatedResponse } from "@/types";

export const approvalsService = {
  pending: async (params: { page?: number; page_size?: number } = {}): Promise<PaginatedResponse<TimesheetHeader>> => {
    const res = await api.get<PaginatedResponse<TimesheetHeader>>("/approvals/pending", { params });
    return res.data;
  },

  all: async (params: { employee_id?: number; status?: string; page?: number; page_size?: number } = {}): Promise<PaginatedResponse<TimesheetHeader>> => {
    const res = await api.get<PaginatedResponse<TimesheetHeader>>("/approvals/all", { params });
    return res.data;
  },

  approve: async (headerId: number, comment?: string): Promise<TimesheetHeader> => {
    const res = await api.post<TimesheetHeader>(`/approvals/${headerId}/approve`, { comment });
    return res.data;
  },

  reject: async (headerId: number, comment: string): Promise<TimesheetHeader> => {
    const res = await api.post<TimesheetHeader>(`/approvals/${headerId}/reject`, { comment });
    return res.data;
  },

  unlock: async (headerId: number, comment?: string): Promise<TimesheetHeader> => {
    const res = await api.post<TimesheetHeader>(`/approvals/${headerId}/unlock`, { comment });
    return res.data;
  },

  history: async (headerId: number): Promise<ApprovalHistory[]> => {
    const res = await api.get<ApprovalHistory[]>(`/approvals/${headerId}/history`);
    return res.data;
  },
};
