import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CheckCircle, Clock, Users, XCircle, TrendingUp, AlertTriangle,
  BarChart2, Shield, UserCheck, Activity, Zap, ArrowRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

import { dashboardService } from "@/services/dashboard.service";
import { useAuthStore } from "@/store/auth.store";
import { useAdminProfileStore } from "@/store/admin-profile.store";

const PIE_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const S = {
  card: {
    background: "var(--surface)",
    border: "1px solid var(--surface-border)",
    boxShadow: "var(--card-shadow)",
  },
  cardHeader: {
    background: "var(--surface-2)",
    borderBottom: "1px solid var(--surface-border)",
  },
  tx1: { color: "var(--tx-1)" },
  tx2: { color: "var(--tx-2)" },
  tx3: { color: "var(--tx-3)" },
};

function StatCard({ icon: Icon, label, value, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-2xl p-4 flex items-center gap-4"
      style={S.card}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18` }}>
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={S.tx3}>{label}</p>
        <p className="text-2xl font-bold leading-none" style={S.tx1}>{value}</p>
      </div>
    </motion.div>
  );
}

function ActionCard({ icon: Icon, label, desc, path, accent, delay = 0, navigate }) {
  return (
    <motion.button
      onClick={() => navigate(path)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2, boxShadow: `0 8px 32px ${accent}22` }}
      whileTap={{ scale: 0.97 }}
      className="text-left rounded-2xl p-4 transition-all group"
      style={S.card}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${accent}15` }}>
        <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
          style={{ color: accent }} />
      </div>
      <p className="text-sm font-semibold mb-0.5" style={S.tx1}>{label}</p>
      <p className="text-xs" style={S.tx3}>{desc}</p>
      <div className="flex items-center gap-1 mt-2.5 text-xs font-medium" style={{ color: accent }}>
        Go <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </motion.button>
  );
}

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const avatar = useAdminProfileStore((s) => s.avatar);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "approver"],
    queryFn: dashboardService.approver,
  });

  const kpis = data?.kpis;
  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "SA";

  return (
    <div className="space-y-5">

      {/* ── Hero banner ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#1E3A8A 0%,#1D4ED8 40%,#0D9488 100%)",
          boxShadow: "0 8px 40px rgba(37,99,235,0.3)",
        }}
      >
        {/* orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"
          style={{ background: "radial-gradient(circle,#60A5FA,transparent)" }} />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full opacity-10 translate-y-1/2 pointer-events-none"
          style={{ background: "radial-gradient(circle,#34D399,transparent)" }} />
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.4),rgba(16,185,129,0.3),transparent)" }} />

        <div className="relative px-6 py-5 flex items-center gap-5">
          {/* Left: info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)" }}>
                <Shield className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">
                Super Admin Dashboard
              </span>
            </div>
            <h1 className="text-xl font-bold text-white leading-tight">
              Welcome back, {user?.full_name?.split(" ")[0]} 👑
            </h1>
            <p className="text-xs text-white/60 mt-0.5">
              {format(new Date(), "EEEE, MMMM d, yyyy")} — Full system access
            </p>
            <div className="flex items-center gap-3 mt-3">
              <motion.button
                onClick={() => navigate("/approvals")}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.25)" }}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Review Approvals
                {(kpis?.pending_approvals ?? 0) > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: "#10B981", color: "#fff" }}>
                    {kpis.pending_approvals}
                  </span>
                )}
              </motion.button>
              <motion.button
                onClick={() => navigate("/audit-logs")}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/80"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <Shield className="h-3.5 w-3.5" />
                Audit Logs
              </motion.button>
            </div>
          </div>

          {/* Right: avatar */}
          <div className="flex-shrink-0 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white overflow-hidden"
              style={{
                background: avatar ? "transparent" : "linear-gradient(135deg,#2563EB,#10B981)",
                boxShadow: "0 0 0 3px rgba(255,255,255,0.2),0 6px 24px rgba(0,0,0,0.3)",
              }}
            >
              {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : initials}
            </div>
            <div className="mt-1.5 flex items-center justify-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-semibold text-white/60">Online</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── KPI cards ─────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-4 h-[84px] animate-pulse"
              style={{ background: "var(--surface-2)", border: "1px solid var(--surface-border)" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon={AlertTriangle} label="Pending"        value={kpis?.pending_approvals ?? 0}  accent="#F59E0B" delay={0.05} />
          <StatCard icon={CheckCircle}  label="Approved/Month" value={kpis?.approved_this_month ?? 0} accent="#10B981" delay={0.08} />
          <StatCard icon={XCircle}      label="Rejected"        value={kpis?.rejected_this_month ?? 0} accent="#EF4444" delay={0.11} />
          <StatCard icon={AlertTriangle} label="Missing"        value={kpis?.missing_timesheets ?? 0}  accent="#EF4444" delay={0.14} />
          <StatCard icon={Users}        label="Employees"       value={kpis?.total_employees ?? 0}      accent="#2563EB" delay={0.17} />
          <StatCard icon={Clock}        label="Avg Hrs/Emp"     value={Number(kpis?.avg_hours_per_employee || 0).toFixed(1)} accent="#8B5CF6" delay={0.2} />
        </div>
      )}

      {/* ── Quick actions ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ActionCard icon={UserCheck}   label="Manage Users"     desc="Add or update accounts"      path="/users"      accent="#2563EB" delay={0.10} navigate={navigate} />
        <ActionCard icon={CheckCircle} label="Approvals"        desc="Timesheets awaiting review"  path="/approvals"  accent="#10B981" delay={0.14} navigate={navigate} />
        <ActionCard icon={Activity}    label="Projects"         desc="Manage project roster"       path="/projects"   accent="#8B5CF6" delay={0.18} navigate={navigate} />
        <ActionCard icon={Shield}      label="Audit Logs"       desc="View system activity"        path="/audit-logs" accent="#2563EB" delay={0.22} navigate={navigate} />
      </div>

      {/* ── Charts ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="lg:col-span-2 rounded-2xl overflow-hidden" style={S.card}
        >
          <div className="px-5 py-3 flex items-center gap-2.5" style={S.cardHeader}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(37,99,235,0.12)" }}>
              <TrendingUp className="h-3.5 w-3.5" style={{ color: "#2563EB" }} />
            </div>
            <p className="text-sm font-semibold" style={S.tx1}>Monthly Hours Overview</p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={data?.monthly_hours_chart || []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="adminBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--tx-3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--tx-3)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{
                  background: "var(--surface)", border: "1px solid var(--surface-border)",
                  borderRadius: 10, fontSize: 12, color: "var(--tx-1)",
                }} cursor={{ fill: "rgba(37,99,235,0.06)" }} />
                <Bar dataKey="value" radius={[5, 5, 0, 0]} name="Hours" fill="url(#adminBarGrad)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="rounded-2xl overflow-hidden" style={S.card}
        >
          <div className="px-5 py-3 flex items-center gap-2.5" style={S.cardHeader}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.12)" }}>
              <BarChart2 className="h-3.5 w-3.5" style={{ color: "#10B981" }} />
            </div>
            <p className="text-sm font-semibold" style={S.tx1}>Top Projects</p>
          </div>
          <div className="p-4">
            {(data?.top_projects?.length ?? 0) === 0 ? (
              <div className="py-10 text-center">
                <BarChart2 className="h-5 w-5 mx-auto mb-3" style={{ color: "var(--tx-3)" }} />
                <p className="text-sm" style={S.tx3}>No project data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={data.top_projects} dataKey="total_hours" nameKey="project_name"
                    cx="50%" cy="50%" innerRadius={50} outerRadius={72} label={false} strokeWidth={2}>
                    {data.top_projects.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={7}
                    formatter={(v) => <span style={{ fontSize: 11, color: "var(--tx-2)" }}>{v}</span>} />
                  <Tooltip
                    formatter={(v) => [`${v.toFixed(1)}h`, "Hours"]}
                    contentStyle={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Pending approvals table ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="rounded-2xl overflow-hidden" style={S.card}
      >
        <div className="px-5 py-3 flex items-center justify-between" style={S.cardHeader}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(245,158,11,0.12)" }}>
              <AlertTriangle className="h-3.5 w-3.5" style={{ color: "#F59E0B" }} />
            </div>
            <p className="text-sm font-semibold" style={S.tx1}>Pending Approvals</p>
          </div>
          <motion.button
            onClick={() => navigate("/approvals")}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: "var(--surface-3)", color: "var(--tx-2)", border: "1px solid var(--surface-border)" }}
          >
            View All <ArrowRight className="h-3 w-3" />
          </motion.button>
        </div>

        {(!data?.pending_approvals || data.pending_approvals.length === 0) ? (
          <div className="py-10 text-center">
            <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.1)" }}>
              <CheckCircle className="h-5 w-5" style={{ color: "#10B981" }} />
            </div>
            <p className="text-sm font-medium" style={S.tx2}>All timesheets reviewed!</p>
            <p className="text-xs mt-1" style={S.tx3}>Nothing waiting for your approval</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--surface-border)", background: "var(--surface-2)" }}>
                  {["Employee", "Week", "Total Hours", "Submitted", "Action"].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                      style={S.tx3}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.pending_approvals.map((item, i) => (
                  <motion.tr
                    key={item.header_id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: "1px solid var(--surface-border)" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#2563EB,#10B981)" }}>
                          {(item.employee_name || "U").charAt(0)}
                        </div>
                        <span className="text-sm font-medium" style={S.tx1}>{item.employee_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm" style={S.tx2}>{item.week_label}</td>
                    <td className="px-5 py-3 text-sm font-bold tabular-nums" style={S.tx1}>{item.total_hours}h</td>
                    <td className="px-5 py-3 text-xs" style={S.tx3}>
                      {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <motion.button
                        onClick={() => navigate("/approvals")}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                        style={{
                          background: "linear-gradient(135deg,#2563EB,#10B981)",
                          boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                        }}
                      >
                        Review
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

    </div>
  );
}
