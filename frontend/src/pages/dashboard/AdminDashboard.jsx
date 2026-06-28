import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Users, XCircle, TrendingUp, AlertTriangle, BarChart2 } from "lucide-react";
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
import { dashboardService } from "@/services/dashboard.service";

const PIE_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4,0,0.2,1] } },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-border-color px-3 py-2 shadow-dropdown text-xs">
      <p className="font-semibold text-text-primary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  );
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: dashboardService.admin,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <div className="h-7 w-40 skeleton mb-2" />
            <div className="h-4 w-28 skeleton" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <Button onClick={() => navigate("/approvals")} className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Review Approvals
          {(kpis?.pending_approvals ?? 0) > 0 && (
            <span className="ml-0.5 bg-white/20 text-white rounded-full px-2 py-0.5 text-xs font-bold border border-white/20">
              {kpis.pending_approvals}
            </span>
          )}
        </Button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="Pending Approvals"   value={kpis?.pending_approvals ?? 0}  icon={AlertTriangle} color="amber" />
        <KpiCard title="Approved This Month" value={kpis?.approved_this_month ?? 0} icon={CheckCircle}   color="green" />
        <KpiCard title="Rejected"            value={kpis?.rejected_this_month ?? 0} icon={XCircle}       color="red" />
        <KpiCard title="Missing Timesheets"  value={kpis?.missing_timesheets ?? 0}  icon={AlertTriangle} color="red" />
        <KpiCard title="Total Employees"     value={kpis?.total_employees ?? 0}     icon={Users}         color="blue" />
        <KpiCard title="Avg Hours/Employee"  value={Number(kpis?.avg_hours_per_employee || 0).toFixed(1)} icon={Clock} color="purple" />
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
              </div>
              Monthly Hours Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data?.monthly_hours_chart || []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,99,235,0.04)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Hours" fill="url(#barGrad)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-secondary-50 to-secondary-100">
                <BarChart2 className="h-3.5 w-3.5 text-secondary-500" />
              </div>
              Top Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.top_projects?.length ?? 0) === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-light-bg flex items-center justify-center mx-auto mb-3">
                  <BarChart2 className="h-5 w-5 text-text-muted" />
                </div>
                <p className="text-sm text-text-secondary font-medium">No data yet</p>
                <p className="text-xs text-text-muted mt-1">Data will appear as timesheets are submitted</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.top_projects}
                    dataKey="total_hours"
                    nameKey="project_name"
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={75}
                    label={false} strokeWidth={2} stroke="#fff"
                  >
                    {data.top_projects.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={7}
                    formatter={(v) => <span className="text-xs text-text-secondary">{v}</span>} />
                  <Tooltip
                    formatter={(v) => [`${v.toFixed(1)}h`, "Hours"]}
                    contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #E2E8F0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pending approvals table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              </div>
              Pending Approvals
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate("/approvals")}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {(!data?.pending_approvals || data.pending_approvals.length === 0) ? (
              <div className="py-14 text-center">
                <div className="w-14 h-14 rounded-2xl bg-secondary-50 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-secondary-400" />
                </div>
                <p className="text-sm font-semibold text-text-secondary">All timesheets reviewed!</p>
                <p className="text-xs text-text-muted mt-1">No pending approvals at this time.</p>
              </div>
            ) : (
              <table className="enterprise-table w-full">
                <thead>
                  <tr>
                    {["Employee", "Week", "Total Hours", "Submitted", "Action"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.pending_approvals.map((item) => (
                    <tr key={item.header_id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #2563EB, #10B981)" }}>
                            {(item.employee_name || "U").charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-text-primary">{item.employee_name}</span>
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
      </motion.div>
    </motion.div>
  );
}
