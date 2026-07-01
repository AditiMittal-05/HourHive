import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, CheckCircle, FileText, XCircle, TrendingUp, CalendarDays, ArrowRight, Timer, Users, UserCheck } from "lucide-react";
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
import { usersService } from "@/services/users.service";
import { approvalsService } from "@/services/approvals.service";
import { useAuthStore } from "@/store/auth.store";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4,0,0.2,1] } },
};

function ManagerTeamPanel({ team, pendingCount, navigate }) {
  return (
    <Card className="overflow-hidden">
      <div
        className="px-6 py-4 border-b border-border-color flex flex-wrap items-center justify-between gap-3"
        style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(16,185,129,0.04) 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2563EB, #10B981)" }}
          >
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">My Team</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              You manage{" "}
              <span className="font-semibold text-text-primary">{team.length}</span>{" "}
              team member{team.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {pendingCount > 0 && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: "rgba(245,158,11,0.12)", color: "#92400E", border: "1px solid rgba(245,158,11,0.22)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
              {pendingCount} pending review
            </span>
          )}
          <Button size="sm" onClick={() => navigate("/approvals")}>
            Review Timesheets <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
      <CardContent className="p-5">
        {team.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="h-8 w-8 text-text-muted mx-auto mb-2.5" />
            <p className="text-sm font-semibold text-text-secondary">No team members assigned yet</p>
            <p className="text-xs text-text-muted mt-1">Contact your administrator to assign employees under you</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {team.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22, delay: i * 0.04 }}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-border-color bg-white hover:shadow-sm hover:border-primary/25 transition-all cursor-default"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #2563EB, #10B981)" }}
                >
                  {member.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{member.full_name}</p>
                  <p className="text-[10px] text-text-secondary truncate">
                    {member.designation || member.department || member.employee_code}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-border-color px-3 py-2 shadow-dropdown text-xs">
      <p className="font-semibold text-text-primary mb-1">{label}</p>
      <p className="text-primary">Hours: <span className="font-bold">{payload[0]?.value}</span></p>
    </div>
  );
};

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isManager = user?.can_approve_timesheets === true;

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "employee"],
    queryFn: dashboardService.employee,
  });

  const { data: orgTree = [] } = useQuery({
    queryKey: ["org-tree"],
    queryFn: usersService.orgTree,
    enabled: isManager,
  });

  const { data: pendingData } = useQuery({
    queryKey: ["approvals", "pending", "manager-panel"],
    queryFn: () => approvalsService.pending({ page: 1, page_size: 1 }),
    enabled: isManager,
  });

  const myTeam = orgTree.filter((u) => u.manager_id === user?.id);
  const pendingCount = pendingData?.total ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <div className="h-7 w-40 skeleton mb-2" />
            <div className="h-4 w-28 skeleton" />
          </div>
        </div>
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
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="page-header">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="page-title">My Dashboard</h1>
            {isManager && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: "rgba(16,185,129,0.12)", color: "#065F46", border: "1px solid rgba(16,185,129,0.22)" }}>
                <UserCheck className="h-3 w-3" /> Team Manager
              </span>
            )}
          </div>
          <p className="page-subtitle">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary-100 bg-primary-50">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
            </span>
          </div>
          <Button onClick={() => navigate("/timesheets/entry")}>
            <Timer className="h-4 w-4" />
            Log Time
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Hours This Month" value={Number(kpis?.current_month_hours || 0).toFixed(1)}
          subtitle="Logged hours" icon={Clock} color="blue" />
        <KpiCard title="Submitted" value={kpis?.submitted_count ?? 0}
          subtitle="Pending review" icon={FileText} color="amber" />
        <KpiCard title="Approved" value={kpis?.approved_count ?? 0}
          subtitle="This period" icon={CheckCircle} color="green" />
        <KpiCard title="Rejected" value={kpis?.rejected_count ?? 0}
          subtitle="Need attention" icon={XCircle} color="red" />
      </motion.div>

      {/* Manager Team Panel */}
      {isManager && (
        <motion.div variants={itemVariants}>
          <ManagerTeamPanel team={myTeam} pendingCount={pendingCount} navigate={navigate} />
        </motion.div>
      )}

      {/* Charts row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                </div>
                Weekly Hours Trend
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => navigate("/timesheets/weekly")}>
                Weekly view <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.weekly_hours || []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fill="url(#hoursGrad)"
                  dot={{ fill: "#2563EB", r: 3.5, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 5, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent entries */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                </div>
                Recent Entries
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => navigate("/timesheets/entry")}>
                Log time <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(!data?.recent_entries || data.recent_entries.length === 0) ? (
              <div className="py-14 text-center">
                <div className="w-14 h-14 rounded-2xl bg-light-bg flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-text-muted" />
                </div>
                <p className="text-sm font-semibold text-text-secondary">No entries yet</p>
                <p className="text-xs text-text-muted mt-1">Start logging your time to see recent entries</p>
                <Button size="sm" className="mt-4" onClick={() => navigate("/timesheets/entry")}>
                  <Timer className="h-3.5 w-3.5" /> Log Time
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border-color/60">
                {data.recent_entries.map((entry, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-light-bg/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(16,185,129,0.06))" }}>
                        <span className="text-xs font-bold text-primary">
                          {Number(entry.hours_worked).toFixed(1)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{entry.project_name}</p>
                        <p className="text-xs text-text-muted">{entry.activity_name} · {entry.work_date}</p>
                      </div>
                    </div>
                    <StatusBadge status={entry.status} />
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
