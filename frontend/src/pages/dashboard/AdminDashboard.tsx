import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, Users, XCircle, TrendingUp, AlertTriangle, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

import { KpiCard } from "@/components/shared/KpiCard";
import { SkeletonCard } from "@/components/shared/PageLoader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/services/dashboard.service";

const COLORS = ["#0F4C81", "#00A86B", "#F59E0B", "#EF4444", "#8B5CF6"];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: dashboardService.admin,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
          <p className="text-text-secondary text-sm mt-0.5">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <Button onClick={() => navigate("/approvals")}>
          <CheckCircle className="h-4 w-4" /> Review Approvals
          {(kpis?.pending_approvals ?? 0) > 0 && (
            <span className="ml-1.5 bg-white/20 text-white rounded-full px-2 py-0.5 text-xs font-bold">
              {kpis!.pending_approvals}
            </span>
          )}
        </Button>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly hours chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Monthly Hours Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data?.monthly_hours_chart || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  <Bar dataKey="value" fill="#0F4C81" radius={[4, 4, 0, 0]} name="Hours" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top projects pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-secondary" /> Top Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.top_projects?.length ?? 0) === 0 ? (
              <div className="py-12 text-center">
                <BarChart2 className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-text-secondary">No data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data!.top_projects} dataKey="total_hours" nameKey="project_name" cx="50%" cy="50%" outerRadius={80} label={false}>
                    {data!.top_projects.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-text-secondary">{v}</span>} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)}h`, "Hours"]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending approvals table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" /> Pending Approvals
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate("/approvals")}>View All</Button>
        </CardHeader>
        <CardContent className="p-0">
          {(!data?.pending_approvals || data.pending_approvals.length === 0) ? (
            <div className="py-12 text-center">
              <CheckCircle className="h-10 w-10 text-green-200 mx-auto mb-2" />
              <p className="text-sm text-text-secondary">All timesheets reviewed!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-light-bg border-b border-border-color">
                <tr>
                  {["Employee", "Week", "Total Hours", "Submitted", "Action"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-text-secondary px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {data.pending_approvals.map((item) => (
                  <tr key={item.header_id} className="hover:bg-light-bg transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-text-primary">{item.employee_name}</td>
                    <td className="px-6 py-3 text-sm text-text-secondary">{item.week_label}</td>
                    <td className="px-6 py-3 text-sm font-bold text-text-primary tabular-nums">{item.total_hours}h</td>
                    <td className="px-6 py-3 text-xs text-text-secondary">{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : "—"}</td>
                    <td className="px-6 py-3">
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
