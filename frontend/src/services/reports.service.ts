import api from "./api";
import type {
  DailyReportRow, MonthlySummaryRow, ProjectEffortRow,
  ActivityReportRow, MissingTimesheetRow, ComparisonRow,
} from "@/types";

export const reportsService = {
  daily: async (params: { start_date?: string; end_date?: string; employee_id?: number; project_id?: number }): Promise<DailyReportRow[]> => {
    const res = await api.get<DailyReportRow[]>("/reports/daily", { params });
    return res.data;
  },

  monthlySummary: async (params: { month: number; year: number; employee_id?: number }): Promise<MonthlySummaryRow[]> => {
    const res = await api.get<MonthlySummaryRow[]>("/reports/monthly-summary", { params });
    return res.data;
  },

  projectEffort: async (params: { start_date?: string; end_date?: string; project_id?: number }): Promise<ProjectEffortRow[]> => {
    const res = await api.get<ProjectEffortRow[]>("/reports/project-effort", { params });
    return res.data;
  },

  activity: async (params: { start_date?: string; end_date?: string; employee_id?: number }): Promise<ActivityReportRow[]> => {
    const res = await api.get<ActivityReportRow[]>("/reports/activity", { params });
    return res.data;
  },

  missingTimesheets: async (params: { start_date: string; end_date: string }): Promise<MissingTimesheetRow[]> => {
    const res = await api.get<MissingTimesheetRow[]>("/reports/missing-timesheets", { params });
    return res.data;
  },

  comparison: async (params: { employee_id: number; month1: number; year1: number; month2: number; year2: number }): Promise<ComparisonRow> => {
    const res = await api.get<ComparisonRow>("/reports/comparison", { params });
    return res.data;
  },

  exportDaily: (params: { start_date?: string; end_date?: string; employee_id?: number; project_id?: number; fmt?: string }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && searchParams.set(k, String(v)));
    return `/api/v1/reports/export/daily?${searchParams.toString()}`;
  },
};
