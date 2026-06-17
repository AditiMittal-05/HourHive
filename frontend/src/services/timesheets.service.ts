import api from "./api";
import type {
  TimesheetEntry, TimesheetEntryCreate, TimesheetEntryUpdate,
  TimesheetHeader, WeeklyGridResponse, CopyDayRequest, PaginatedResponse,
} from "@/types";

export const timesheetsService = {
  weeklyGrid: async (weekStart: string): Promise<WeeklyGridResponse> => {
    const res = await api.get<WeeklyGridResponse>("/timesheets/weekly", { params: { week_start: weekStart } });
    return res.data;
  },

  dailyEntries: async (workDate: string): Promise<TimesheetEntry[]> => {
    const res = await api.get<TimesheetEntry[]>("/timesheets/daily", { params: { work_date: workDate } });
    return res.data;
  },

  addEntry: async (data: TimesheetEntryCreate): Promise<TimesheetEntry> => {
    const res = await api.post<TimesheetEntry>("/timesheets/entries", data);
    return res.data;
  },

  updateEntry: async (id: number, data: TimesheetEntryUpdate): Promise<TimesheetEntry> => {
    const res = await api.put<TimesheetEntry>(`/timesheets/entries/${id}`, data);
    return res.data;
  },

  deleteEntry: async (id: number): Promise<void> => {
    await api.delete(`/timesheets/entries/${id}`);
  },

  copyDay: async (data: CopyDayRequest): Promise<TimesheetEntry[]> => {
    const res = await api.post<TimesheetEntry[]>("/timesheets/copy-day", data);
    return res.data;
  },

  submitTimesheet: async (headerId: number): Promise<TimesheetHeader> => {
    const res = await api.post<TimesheetHeader>(`/timesheets/headers/${headerId}/submit`);
    return res.data;
  },

  listTimesheets: async (params: { page?: number; page_size?: number } = {}): Promise<PaginatedResponse<TimesheetHeader>> => {
    const res = await api.get<PaginatedResponse<TimesheetHeader>>("/timesheets/headers", { params });
    return res.data;
  },
};
