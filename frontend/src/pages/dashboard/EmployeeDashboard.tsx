import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle, FileText, XCircle, TrendingUp, CalendarDays } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format, parseISO } from "date-fns";

import { KpiCard } from "@/components/shared/KpiCard";
import { SkeletonCard, SkeletonTable } from "@/components/shared/PageLoader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardService } from "@/services/dashboard.service";
import type { TimesheetStatus } from "@/types";

export function EmployeeDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "employee"],
    queryFn: dashboardService.employee,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonTable />
          <SkeletonTable />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Dashboard</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Hours This Month" value={Number(kpis?.current_month_hours || 0).toFixed(1)} subtitle="Logged hours" icon={Clock} color="blue" />
        <KpiCard title="Submitted" value={kpis?.submitted_count ?? 0} subtitle="Pending review" icon={FileText} color="amber" />
        <KpiCard title="Approved" value={kpis?.approved_count ?? 0} subtitle="This period" icon={CheckCircle} color="green" />
        <KpiCard title="Rejected" value={kpis?.rejected_count ?? 0} subtitle="Need attention" icon={XCircle} color="red" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly hours chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Weekly Hours Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data?.weekly_hours || []}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0F4C81" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Area type="monotone" dataKey="hours" stroke="#0F4C81" strokeWidth={2} fill="url(#hoursGrad)" dot={{ fill: "#0F4C81", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Recent Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(!data?.recent_entries || data.recent_entries.length === 0) ? (
              <div className="py-12 text-center">
                <Clock className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-text-secondary text-sm">No entries yet this period</p>
              </div>
            ) : (
              <div className="divide-y divide-border-color">
                {data.recent_entries.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-light-bg transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{entry.project_name}</p>
                      <p className="text-xs text-text-secondary">{entry.activity_name} · {entry.work_date}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <span className="text-sm font-bold text-text-primary tabular-nums">{entry.hours_worked}h</span>
                      <StatusBadge status={entry.status as TimesheetStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
