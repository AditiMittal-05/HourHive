import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle, FileText, XCircle, TrendingUp, CalendarDays, ArrowRight } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import { KpiCard } from "@/components/shared/KpiCard";
import { SkeletonCard, SkeletonTable } from "@/components/shared/PageLoader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/services/dashboard.service";

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "employee"],
    queryFn: dashboardService.employee,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonTable rows={6} />
          <SkeletonTable rows={6} />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">My Dashboard</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary-100 bg-primary-50">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Hours This Month"
          value={Number(kpis?.current_month_hours || 0).toFixed(1)}
          subtitle="Logged hours"
          icon={Clock}
          color="blue"
        />
        <KpiCard
          title="Submitted"
          value={kpis?.submitted_count ?? 0}
          subtitle="Pending review"
          icon={FileText}
          color="amber"
        />
        <KpiCard
          title="Approved"
          value={kpis?.approved_count ?? 0}
          subtitle="This period"
          icon={CheckCircle}
          color="green"
        />
        <KpiCard
          title="Rejected"
          value={kpis?.rejected_count ?? 0}
          subtitle="Need attention"
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly hours chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                </div>
                Weekly Hours Trend
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-text-secondary h-7 px-2"
                onClick={() => navigate("/timesheets/weekly")}
              >
                View weekly <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.weekly_hours || []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B2E59" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#0B2E59" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #E2E8F0",
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#0B2E59"
                  strokeWidth={2}
                  fill="url(#hoursGrad)"
                  dot={{ fill: "#0B2E59", r: 3, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 5, fill: "#A7CE39", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent entries */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                </div>
                Recent Entries
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-text-secondary h-7 px-2"
                onClick={() => navigate("/timesheets/entry")}
              >
                Log time <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(!data?.recent_entries || data.recent_entries.length === 0) ? (
              <div className="py-14 text-center">
                <div className="w-12 h-12 rounded-xl bg-light-bg flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-5 w-5 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-text-secondary">No entries yet this period</p>
                <p className="text-xs text-text-secondary/60 mt-1">Start logging your time below</p>
              </div>
            ) : (
              <div className="divide-y divide-border-color">
                {data.recent_entries.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-6 py-3 hover:bg-light-bg/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {Number(entry.hours_worked).toFixed(1)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{entry.project_name}</p>
                        <p className="text-xs text-text-secondary">{entry.activity_name} · {entry.work_date}</p>
                      </div>
                    </div>
                    <StatusBadge status={entry.status} />
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
