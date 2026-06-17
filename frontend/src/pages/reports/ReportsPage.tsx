import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Filter, BarChart3, FileText, Users, FolderKanban, AlertCircle } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { reportsService } from "@/services/reports.service";
import { projectsService } from "@/services/projects.service";
import { usersService } from "@/services/users.service";
import { SkeletonTable } from "@/components/shared/PageLoader";
import { useAuthStore } from "@/store/auth.store";

type ReportType = "daily" | "monthly" | "project" | "activity" | "missing";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function ReportsPage() {
  const [tab, setTab] = useState<ReportType>("daily");
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Daily report filters
  const [dailyFilters, setDailyFilters] = useState({
    start_date: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"),
    end_date: format(new Date(), "yyyy-MM-dd"),
    employee_id: undefined as number | undefined,
    project_id: undefined as number | undefined,
  });

  // Monthly filters
  const [monthlyFilters, setMonthlyFilters] = useState({ month: currentMonth, year: currentYear });

  // Missing filters
  const [missingFilters, setMissingFilters] = useState({
    start_date: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"),
    end_date: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: projects } = useQuery({ queryKey: ["projects-dropdown"], queryFn: projectsService.dropdown, enabled: isAdmin });
  const { data: users } = useQuery({ queryKey: ["users-dropdown"], queryFn: usersService.dropdown, enabled: isAdmin });

  const dailyQuery = useQuery({
    queryKey: ["report-daily", dailyFilters],
    queryFn: () => reportsService.daily(dailyFilters),
    enabled: tab === "daily",
  });

  const monthlyQuery = useQuery({
    queryKey: ["report-monthly", monthlyFilters],
    queryFn: () => reportsService.monthlySummary(monthlyFilters),
    enabled: tab === "monthly",
  });

  const projectQuery = useQuery({
    queryKey: ["report-project"],
    queryFn: () => reportsService.projectEffort({ start_date: dailyFilters.start_date, end_date: dailyFilters.end_date }),
    enabled: tab === "project" && isAdmin,
  });

  const activityQuery = useQuery({
    queryKey: ["report-activity", dailyFilters],
    queryFn: () => reportsService.activity({ start_date: dailyFilters.start_date, end_date: dailyFilters.end_date }),
    enabled: tab === "activity",
  });

  const missingQuery = useQuery({
    queryKey: ["report-missing", missingFilters],
    queryFn: () => reportsService.missingTimesheets(missingFilters),
    enabled: tab === "missing" && isAdmin,
  });

  const tabs = [
    { key: "daily", label: "Daily Report", icon: FileText },
    { key: "monthly", label: "Monthly Summary", icon: Users },
    { key: "project", label: "Project Effort", icon: FolderKanban, adminOnly: true },
    { key: "activity", label: "Activity Report", icon: BarChart3 },
    { key: "missing", label: "Missing Timesheets", icon: AlertCircle, adminOnly: true },
  ].filter((t) => !t.adminOnly || isAdmin);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
          <p className="text-text-secondary text-sm mt-0.5">Generate and export detailed reports</p>
        </div>
        {tab === "daily" && (
          <Button variant="outline" asChild>
            <a href={reportsService.exportDaily({ ...dailyFilters, fmt: "excel" })} download>
              <Download className="h-4 w-4" /> Export Excel
            </a>
          </Button>
        )}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 bg-light-bg rounded-xl border border-border-color w-fit">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as ReportType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? "bg-white shadow-sm text-primary border border-border-color" : "text-text-secondary hover:text-text-primary"}`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          {(tab === "daily" || tab === "project" || tab === "activity") && (
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Start Date</Label>
                <Input type="date" value={dailyFilters.start_date} onChange={(e) => setDailyFilters((f) => ({ ...f, start_date: e.target.value }))} className="w-40" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End Date</Label>
                <Input type="date" value={dailyFilters.end_date} onChange={(e) => setDailyFilters((f) => ({ ...f, end_date: e.target.value }))} className="w-40" />
              </div>
              {isAdmin && tab === "daily" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Employee</Label>
                    <Select value={dailyFilters.employee_id?.toString() || "all"} onValueChange={(v) => setDailyFilters((f) => ({ ...f, employee_id: v === "all" ? undefined : parseInt(v) }))}>
                      <SelectTrigger className="w-44"><SelectValue placeholder="All Employees" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        {users?.map((u) => <SelectItem key={u.id} value={u.id.toString()}>{u.full_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Project</Label>
                    <Select value={dailyFilters.project_id?.toString() || "all"} onValueChange={(v) => setDailyFilters((f) => ({ ...f, project_id: v === "all" ? undefined : parseInt(v) }))}>
                      <SelectTrigger className="w-44"><SelectValue placeholder="All Projects" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects?.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.project_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          )}
          {tab === "monthly" && (
            <div className="flex gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Month</Label>
                <Select value={monthlyFilters.month.toString()} onValueChange={(v) => setMonthlyFilters((f) => ({ ...f, month: parseInt(v) }))}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i + 1} value={(i + 1).toString()}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Year</Label>
                <Select value={monthlyFilters.year.toString()} onValueChange={(v) => setMonthlyFilters((f) => ({ ...f, year: parseInt(v) }))}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[currentYear, currentYear - 1, currentYear - 2].map((y) => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {tab === "missing" && (
            <div className="flex gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Start Date</Label>
                <Input type="date" value={missingFilters.start_date} onChange={(e) => setMissingFilters((f) => ({ ...f, start_date: e.target.value }))} className="w-40" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End Date</Label>
                <Input type="date" value={missingFilters.end_date} onChange={(e) => setMissingFilters((f) => ({ ...f, end_date: e.target.value }))} className="w-40" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report tables */}
      <Card>
        <CardContent className="p-0">
          {/* Daily Report */}
          {tab === "daily" && (
            dailyQuery.isLoading ? <div className="p-6"><SkeletonTable /></div> :
            <table className="w-full">
              <thead className="bg-light-bg border-b border-border-color">
                <tr>{["Date", "Employee", "Code", "Project", "Activity", "Hours", "Billable"].map((h) => <th key={h} className="text-left text-xs font-semibold text-text-secondary px-5 py-3">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {(dailyQuery.data || []).length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-text-secondary text-sm">No data for selected filters</td></tr>
                ) : (dailyQuery.data || []).map((row, i) => (
                  <tr key={i} className="hover:bg-light-bg transition-colors">
                    <td className="px-5 py-3 text-sm text-text-secondary">{row.work_date}</td>
                    <td className="px-5 py-3 text-sm font-medium text-text-primary">{row.employee_name}</td>
                    <td className="px-5 py-3 text-sm font-mono text-text-secondary">{row.employee_code}</td>
                    <td className="px-5 py-3 text-sm text-text-primary">{row.project_name}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{row.activity_name}</td>
                    <td className="px-5 py-3 text-sm font-bold text-text-primary tabular-nums">{Number(row.hours_worked).toFixed(2)}h</td>
                    <td className="px-5 py-3"><Badge variant={row.is_billable ? "success" : "outline"}>{row.is_billable ? "Yes" : "No"}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Monthly Summary */}
          {tab === "monthly" && (
            monthlyQuery.isLoading ? <div className="p-6"><SkeletonTable /></div> :
            <table className="w-full">
              <thead className="bg-light-bg border-b border-border-color">
                <tr>{["Employee", "Code", "Total Hours", "Working Days", "Avg Hours/Day"].map((h) => <th key={h} className="text-left text-xs font-semibold text-text-secondary px-5 py-3">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {(monthlyQuery.data || []).map((row, i) => (
                  <tr key={i} className="hover:bg-light-bg transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-text-primary">{row.employee_name}</td>
                    <td className="px-5 py-3 text-sm font-mono text-text-secondary">{row.employee_code}</td>
                    <td className="px-5 py-3 text-sm font-bold text-primary tabular-nums">{Number(row.total_hours).toFixed(1)}h</td>
                    <td className="px-5 py-3 text-sm text-text-primary tabular-nums">{row.working_days}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary tabular-nums">{Number(row.avg_daily_hours).toFixed(2)}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Project Effort */}
          {tab === "project" && (
            projectQuery.isLoading ? <div className="p-6"><SkeletonTable /></div> :
            <table className="w-full">
              <thead className="bg-light-bg border-b border-border-color">
                <tr>{["Project", "Code", "Customer", "Total Hours", "Billable", "Non-Billable"].map((h) => <th key={h} className="text-left text-xs font-semibold text-text-secondary px-5 py-3">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {(projectQuery.data || []).map((row, i) => (
                  <tr key={i} className="hover:bg-light-bg transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-text-primary">{row.project_name}</td>
                    <td className="px-5 py-3 text-sm font-mono text-text-secondary">{row.project_code}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{row.customer_name}</td>
                    <td className="px-5 py-3 text-sm font-bold text-primary tabular-nums">{Number(row.total_hours).toFixed(1)}h</td>
                    <td className="px-5 py-3 text-sm text-success tabular-nums">{Number(row.billable_hours).toFixed(1)}h</td>
                    <td className="px-5 py-3 text-sm text-text-secondary tabular-nums">{Number(row.non_billable_hours).toFixed(1)}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Activity Report */}
          {tab === "activity" && (
            activityQuery.isLoading ? <div className="p-6"><SkeletonTable /></div> :
            <table className="w-full">
              <thead className="bg-light-bg border-b border-border-color">
                <tr>{["Activity", "Total Hours", "Percentage", "Distribution"].map((h) => <th key={h} className="text-left text-xs font-semibold text-text-secondary px-5 py-3">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {(activityQuery.data || []).map((row, i) => (
                  <tr key={i} className="hover:bg-light-bg transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-text-primary">{row.activity_name}</td>
                    <td className="px-5 py-3 text-sm font-bold text-primary tabular-nums">{Number(row.total_hours).toFixed(1)}h</td>
                    <td className="px-5 py-3 text-sm text-text-secondary tabular-nums">{row.percentage}%</td>
                    <td className="px-5 py-3">
                      <div className="h-2 bg-slate-100 rounded-full w-32 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${row.percentage}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Missing Timesheets */}
          {tab === "missing" && (
            missingQuery.isLoading ? <div className="p-6"><SkeletonTable /></div> :
            <table className="w-full">
              <thead className="bg-light-bg border-b border-border-color">
                <tr>{["Employee", "Code", "Missing Days", "Missing Dates"].map((h) => <th key={h} className="text-left text-xs font-semibold text-text-secondary px-5 py-3">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {(missingQuery.data || []).map((row, i) => (
                  <tr key={i} className="hover:bg-light-bg transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-text-primary">{row.employee_name}</td>
                    <td className="px-5 py-3 text-sm font-mono text-text-secondary">{row.employee_code}</td>
                    <td className="px-5 py-3"><Badge variant="destructive">{row.missing_days_count} days</Badge></td>
                    <td className="px-5 py-3 text-xs text-text-secondary max-w-xs">
                      {row.missing_dates.slice(0, 5).join(", ")}{row.missing_dates.length > 5 && ` +${row.missing_dates.length - 5} more`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
