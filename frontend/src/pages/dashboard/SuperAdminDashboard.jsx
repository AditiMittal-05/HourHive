import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle, Clock, Users, XCircle, TrendingUp, AlertTriangle,
  BarChart2, Shield, UserCheck, Activity,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

import { KpiCard } from "@/components/shared/KpiCard";
import { SkeletonCard } from "@/components/shared/PageLoader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dashboardService } from "@/services/dashboard.service";
import { useAuthStore } from "@/store/auth.store";

const PIE_COLORS = ["#0B2E59", "#A7CE39", "#F59E0B", "#EF4444", "#8B5CF6"];

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: dashboardService.admin,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #D97706, #B45309)" }}>
              <Shield className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Super Admin Dashboard</h1>
          </div>
          <p className="text-text-secondary text-sm">
            {format(new Date(), "EEEE, MMMM d, yyyy")} — Full system access
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/audit-logs")} className="gap-2">
            <Shield className="h-4 w-4" />
            Audit Logs
          </Button>
          <Button onClick={() => navigate("/approvals")} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Review Approvals
            {(kpis?.pending_approvals ?? 0) > 0 && (
              <span className="ml-0.5 bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs font-bold">
                {kpis.pending_approvals}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* SuperAdmin identity banner */}
      <div className="rounded-xl border p-4 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, rgba(217,119,6,0.06), rgba(180,83,9,0.04))", borderColor: "rgba(217,119,6,0.2)" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #D97706, #B45309)" }}>
          {user?.full_name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">
            Logged in as <span style={{ color: "#B45309" }}>{user?.full_name}</span>
          </p>
          <p className="text-xs text-text-secondary">
            Super Admin — Permanent account with full system access. Cannot be deleted or demoted.
          </p>
        </div>
        <Badge className="ml-auto" style={{ background: "rgba(217,119,6,0.12)", color: "#92400E", border: "1px solid rgba(217,119,6,0.2)" }}>
          Super Admin
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="Pending Approvals" value={kpis?.pending_approvals ?? 0} icon={AlertTriangle} color="amber" />
        <KpiCard title="Approved This Month" value={kpis?.approved_this_month ?? 0} icon={CheckCircle} color="green" />
        <KpiCard title="Rejected" value={kpis?.rejected_this_month ?? 0} icon={XCircle} color="red" />
        <KpiCard title="Missing Timesheets" value={kpis?.missing_timesheets ?? 0} icon={AlertTriangle} color="red" />
        <KpiCard title="Total Employees" value={kpis?.total_employees ?? 0} icon={Users} color="blue" />
        <KpiCard title="Avg Hours/Employee" value={Number(kpis?.avg_hours_per_employee || 0).toFixed(1)} icon={Clock} color="purple" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Manage Users", icon: UserCheck, path: "/users", desc: "Add or update accounts" },
          { label: "Review Approvals", icon: CheckCircle, path: "/approvals", desc: "Timesheets awaiting review" },
          { label: "Projects", icon: Activity, path: "/projects", desc: "Manage project roster" },
          { label: "Audit Logs", icon: Shield, path: "/audit-logs", desc: "View system activity" },
        ].map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="text-left p-4 rounded-xl border border-border-color bg-white hover:bg-light-bg hover:border-primary/20 transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
              <action.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm font-semibold text-text-primary">{action.label}</p>
            <p className="text-xs text-text-secondary mt-0.5">{action.desc}</p>
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                </div>
                Monthly Hours Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data?.monthly_hours_chart || []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} cursor={{ fill: "rgba(11,46,89,0.04)" }} />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]} name="Hours" fill="#0B2E59" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-7 h-7 rounded-lg bg-secondary-50 flex items-center justify-center">
                <BarChart2 className="h-3.5 w-3.5 text-secondary-600" />
              </div>
              Top Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.top_projects?.length ?? 0) === 0 ? (
              <div className="py-12 text-center">
                <BarChart2 className="h-5 w-5 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-text-secondary">No data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data.top_projects} dataKey="total_hours" nameKey="project_name"
                    cx="50%" cy="50%" innerRadius={50} outerRadius={75} label={false} strokeWidth={2}>
                    {data.top_projects.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={7} formatter={(v) => <span className="text-xs text-text-secondary">{v}</span>} />
                  <Tooltip formatter={(v) => [`${v.toFixed(1)}h`, "Hours"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending approvals table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            </div>
            Pending Approvals
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate("/approvals")}>View All</Button>
        </CardHeader>
        <CardContent className="p-0">
          {(!data?.pending_approvals || data.pending_approvals.length === 0) ? (
            <div className="py-12 text-center">
              <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-text-secondary">All timesheets reviewed!</p>
            </div>
          ) : (
            <table className="enterprise-table w-full">
              <thead>
                <tr>{["Employee", "Week", "Total Hours", "Submitted", "Action"].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {data.pending_approvals.map((item) => (
                  <tr key={item.header_id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #0B2E59, #123D72)" }}>
                          {(item.employee_name || "U").charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-text-primary">{item.employee_name}</span>
                      </div>
                    </td>
                    <td className="text-sm text-text-secondary">{item.week_label}</td>
                    <td className="text-sm font-bold text-text-primary tabular-nums">{item.total_hours}h</td>
                    <td className="text-xs text-text-secondary">
                      {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <Button size="sm" onClick={() => navigate("/approvals")}>Review</Button>
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
