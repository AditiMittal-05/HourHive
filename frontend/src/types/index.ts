// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthUser {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  role: "employee" | "admin";
  status: "active" | "inactive";
  department?: string;
  designation?: string;
  phone?: string;
  profile_pic?: string;
  last_login?: string;
  created_at: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = "employee" | "admin";
export type UserStatus = "active" | "inactive";

export interface User {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  designation?: string;
  phone?: string;
  profile_pic?: string;
  last_login?: string;
  created_at: string;
}

export interface UserCreate {
  employee_code: string;
  full_name: string;
  email: string;
  role: UserRole;
  department?: string;
  designation?: string;
  phone?: string;
}

export interface UserUpdate {
  full_name?: string;
  email?: string;
  role?: UserRole;
  department?: string;
  designation?: string;
  phone?: string;
  status?: UserStatus;
}

export interface UserDropdown {
  id: number;
  employee_code: string;
  full_name: string;
}

// ─── Project ─────────────────────────────────────────────────────────────────

export type ProjectStatus = "active" | "inactive" | "completed" | "on_hold";

export interface Project {
  id: number;
  project_code: string;
  project_name: string;
  customer_name: string;
  start_date: string;
  end_date?: string;
  status: ProjectStatus;
  project_manager_id?: number;
  manager_name?: string;
  description?: string;
  created_at: string;
}

export interface ProjectCreate {
  project_code: string;
  project_name: string;
  customer_name: string;
  start_date: string;
  end_date?: string;
  description?: string;
  project_manager_id?: number;
}

export interface ProjectUpdate {
  project_name?: string;
  customer_name?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  project_manager_id?: number;
  status?: ProjectStatus;
}

export interface ProjectDropdown {
  id: number;
  project_code: string;
  project_name: string;
}

// ─── Activity ────────────────────────────────────────────────────────────────

export type ActivityStatus = "active" | "inactive";

export interface Activity {
  id: number;
  activity_code: string;
  activity_name: string;
  category?: string;
  is_billable: boolean;
  status: ActivityStatus;
  created_at: string;
}

export interface ActivityCreate {
  activity_code: string;
  activity_name: string;
  category?: string;
  is_billable: boolean;
}

export interface ActivityUpdate {
  activity_name?: string;
  category?: string;
  is_billable?: boolean;
  status?: ActivityStatus;
}

// ─── Timesheet ───────────────────────────────────────────────────────────────

export type TimesheetStatus = "draft" | "submitted" | "approved" | "rejected" | "resubmitted";

export interface TimesheetEntry {
  id: number;
  header_id: number;
  employee_id: number;
  project_id: number;
  project_name?: string;
  project_code?: string;
  activity_id: number;
  activity_name?: string;
  work_date: string;
  hours_worked: number;
  description?: string;
  is_billable: boolean;
  created_at: string;
}

export interface TimesheetEntryCreate {
  project_id: number;
  activity_id: number;
  work_date: string;
  hours_worked: number;
  description?: string;
  is_billable?: boolean;
}

export interface TimesheetEntryUpdate {
  project_id?: number;
  activity_id?: number;
  hours_worked?: number;
  description?: string;
  is_billable?: boolean;
}

export interface TimesheetHeader {
  id: number;
  employee_id: number;
  employee_name?: string;
  week_start_date: string;
  week_end_date: string;
  total_hours: number;
  status: TimesheetStatus;
  submitted_at?: string;
  approved_at?: string;
  rejection_reason?: string;
  is_locked: boolean;
  details: TimesheetEntry[];
  created_at: string;
}

export interface WeeklyGridEntry {
  project_id: number;
  project_name: string;
  project_code: string;
  activity_id: number;
  activity_name: string;
  mon?: number;
  tue?: number;
  wed?: number;
  thu?: number;
  fri?: number;
  sat?: number;
  sun?: number;
  row_total: number;
}

export interface WeeklyGridResponse {
  week_start_date: string;
  week_end_date: string;
  header_id?: number;
  status?: TimesheetStatus;
  entries: WeeklyGridEntry[];
  day_totals: Record<string, number>;
  grand_total: number;
}

export interface CopyDayRequest {
  from_date: string;
  to_date: string;
}

// ─── Approval ────────────────────────────────────────────────────────────────

export interface ApprovalHistory {
  id: number;
  header_id: number;
  action_by: number;
  action: "submit" | "approve" | "reject" | "unlock" | "resubmit";
  comment?: string;
  previous_status?: string;
  new_status?: string;
  created_at: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface EmployeeKPIs {
  current_month_hours: number;
  submitted_count: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
}

export interface AdminKPIs {
  pending_approvals: number;
  approved_this_month: number;
  rejected_this_month: number;
  missing_timesheets: number;
  total_employees: number;
  avg_hours_per_employee: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface WeeklyHoursData {
  week: string;
  hours: number;
}

export interface RecentEntry {
  work_date: string;
  project_name: string;
  activity_name: string;
  hours_worked: number;
  status: string;
}

export interface HeatmapDay {
  date: string;
  hours: number;
}

export interface TopProject {
  project_name: string;
  total_hours: number;
}

export interface PendingItem {
  header_id: number;
  employee_name: string;
  week_label: string;
  total_hours: number;
  submitted_at?: string;
}

export interface EmployeeDashboard {
  kpis: EmployeeKPIs;
  weekly_hours: WeeklyHoursData[];
  recent_entries: RecentEntry[];
  heatmap: HeatmapDay[];
}

export interface AdminDashboard {
  kpis: AdminKPIs;
  top_projects: TopProject[];
  pending_approvals: PendingItem[];
  monthly_hours_chart: ChartDataPoint[];
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface DailyReportRow {
  work_date: string;
  employee_name: string;
  employee_code: string;
  project_name: string;
  activity_name: string;
  hours_worked: number;
  description?: string;
  is_billable: boolean;
}

export interface MonthlySummaryRow {
  employee_name: string;
  employee_code: string;
  total_hours: number;
  working_days: number;
  avg_daily_hours: number;
}

export interface ProjectEffortRow {
  project_name: string;
  project_code: string;
  customer_name: string;
  total_hours: number;
  billable_hours: number;
  non_billable_hours: number;
}

export interface ActivityReportRow {
  activity_name: string;
  total_hours: number;
  percentage: number;
}

export interface MissingTimesheetRow {
  employee_name: string;
  employee_code: string;
  missing_dates: string[];
  missing_days_count: number;
}

export interface ComparisonRow {
  label: string;
  month1_hours: number;
  month2_hours: number;
  difference: number;
  percentage_change?: number;
}

// ─── Common ──────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
