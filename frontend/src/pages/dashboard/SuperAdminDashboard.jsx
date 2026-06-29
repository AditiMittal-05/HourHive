import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CheckCircle, Clock, Users, XCircle, TrendingUp,
  AlertTriangle, BarChart2, Shield, Zap, ArrowRight, Briefcase,
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

const DEPT_COLORS = ["#2563EB","#10B981","#8B5CF6","#F59E0B","#EF4444","#06B6D4","#EC4899","#84CC16"];

const S = {
  card:  { background: "var(--surface)", border: "1px solid var(--surface-border)", boxShadow: "var(--card-shadow)" },
  hdr:   { background: "var(--surface-2)", borderBottom: "1px solid var(--surface-border)" },
  tx1:   { color: "var(--tx-1)" },
  tx2:   { color: "var(--tx-2)" },
  tx3:   { color: "var(--tx-3)" },
};

/* ── Tiny KPI pill ──────────────────────────────────────────── */
function KPICard({ icon: Icon, label, value, accent, sub, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.4,0,0.2,1] }}
      className="rounded-xl px-4 py-3 flex items-center gap-3 flex-1 min-w-0"
      style={S.card}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18` }}>
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-wider" style={S.tx3}>{label}</p>
        <p className="text-xl font-bold leading-tight tabular-nums" style={S.tx1}>{value}</p>
        {sub && <p className="text-[9px]" style={S.tx3}>{sub}</p>}
      </div>
    </motion.div>
  );
}

const RANK_BG = ["#FEF3C7","#F1F5F9","#FEE2E2"];
const RANK_CO = ["#D97706","#475569","#B45309"];

export function SuperAdminDashboard() {
  const navigate  = useNavigate();
  const user      = useAuthStore((s) => s.user);
  const avatar    = useAdminProfileStore((s) => s.avatar);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "approver"],
    queryFn:  dashboardService.approver,
  });

  const kpis      = data?.kpis;
  const initials  = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).slice(0,2).join("").toUpperCase()
    : "SA";

  const maxProjHours = data?.top_projects?.[0]?.total_hours || 1;

  return (
    /* Full-height flex column matching AppLayout inner area */
    <div
      className="flex flex-col gap-3"
      style={{ height: "calc(100vh - 64px - 48px)" }}
    >

      {/* ── ROW 1 — Hero + 4 KPI pills side by side ──────────── */}
      <div className="flex gap-3 flex-shrink-0">

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-xl overflow-hidden flex-shrink-0"
          style={{
            background: "linear-gradient(135deg,#1E3A8A 0%,#1D4ED8 45%,#0D9488 100%)",
            boxShadow: "0 4px 24px rgba(37,99,235,0.28)",
            width: 320,
          }}
        >
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"
            style={{ background: "radial-gradient(circle,#60A5FA,transparent)" }} />
          <div className="absolute inset-0 top-0 left-0 right-0 h-[2px] pointer-events-none"
            style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)" }} />

          <div className="relative px-5 py-4 flex items-center gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white overflow-hidden"
                style={{
                  background: avatar ? "transparent" : "linear-gradient(135deg,#2563EB,#10B981)",
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.2),0 4px 16px rgba(0,0,0,0.25)",
                }}
              >
                {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : initials}
              </div>
              <div className="mt-1 flex items-center justify-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-semibold text-white/55">Online</span>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Shield className="h-3 w-3 text-white/50" />
                <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Super Admin</span>
              </div>
              <h1 className="text-base font-bold text-white leading-tight truncate">
                {user?.full_name?.split(" ")[0]} 👑
              </h1>
              <p className="text-[10px] text-white/55 mt-0.5">
                {format(new Date(), "EEE, MMM d yyyy")}
              </p>

              {/* Inline action buttons */}
              <div className="flex items-center gap-2 mt-2.5">
                <motion.button
                  onClick={() => navigate("/approvals")}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white"
                  style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.22)" }}
                >
                  <CheckCircle className="h-3 w-3" /> Approvals
                  {(kpis?.pending_approvals ?? 0) > 0 && (
                    <span className="ml-0.5 px-1 rounded-full text-[9px] font-bold"
                      style={{ background: "#10B981" }}>{kpis.pending_approvals}</span>
                  )}
                </motion.button>
                <motion.button
                  onClick={() => navigate("/audit-logs")}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white/75"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}
                >
                  <Shield className="h-3 w-3" /> Audit
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4 KPI pills stacked 2×2 */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          <KPICard icon={Users}         label="Employees"         value={kpis?.total_employees ?? "—"}                                   accent="#2563EB" sub="Active in system"  delay={0.05} />
          <KPICard icon={Briefcase}     label="Active Projects"   value={kpis?.active_projects ?? "—"}                                   accent="#8B5CF6" sub="Last 90 days"      delay={0.08} />
          <KPICard icon={AlertTriangle} label="Pending Approvals" value={kpis?.pending_approvals ?? "—"}                                  accent="#F59E0B" sub="Awaiting review"   delay={0.11} />
          <KPICard icon={Clock}         label="Hours This Month"  value={`${(kpis?.total_hours_this_month ?? 0).toLocaleString()}h`}       accent="#06B6D4" sub="All employees"     delay={0.14} />
        </div>
      </div>

      {/* ── ROW 2 — Monthly chart + Dept pie + mini KPI strip ─── */}
      <div className="flex gap-3 flex-shrink-0">

        {/* Monthly hours bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          className="rounded-xl overflow-hidden flex-1"
          style={S.card}
        >
          <div className="px-4 py-2.5 flex items-center gap-2" style={S.hdr}>
            <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#2563EB" }} />
            <span className="text-xs font-semibold flex-1" style={S.tx1}>Monthly Hours</span>
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(37,99,235,0.1)", color: "#2563EB" }}>Last 6 months</span>
          </div>
          <div className="p-3">
            {isLoading ? (
              <div className="h-[148px] animate-pulse rounded-lg" style={{ background: "var(--surface-2)" }} />
            ) : (
              <ResponsiveContainer width="100%" height={148}>
                <BarChart data={data?.monthly_hours_chart || []} margin={{ top: 2, right: 4, bottom: 0, left: -24 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--tx-3)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--tx-3)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 8, fontSize: 11 }}
                    cursor={{ fill: "rgba(37,99,235,0.06)" }}
                    formatter={(v) => [`${Number(v).toFixed(0)}h`, "Hours"]}
                  />
                  <Bar dataKey="value" radius={[4,4,0,0]} fill="url(#barGrad)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Dept pie */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="rounded-xl overflow-hidden"
          style={{ ...S.card, width: 230 }}
        >
          <div className="px-4 py-2.5 flex items-center gap-2" style={S.hdr}>
            <BarChart2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#8B5CF6" }} />
            <span className="text-xs font-semibold" style={S.tx1}>Dept Breakdown</span>
          </div>
          <div className="px-2 pt-1 pb-2">
            {isLoading ? (
              <div className="h-[168px] animate-pulse rounded-lg" style={{ background: "var(--surface-2)" }} />
            ) : (data?.dept_hours?.length ?? 0) === 0 ? (
              <div className="h-[168px] flex items-center justify-center">
                <p className="text-xs" style={S.tx3}>No data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={168}>
                <PieChart margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                  <Pie data={data.dept_hours} dataKey="value" nameKey="label"
                    cx="50%" cy="44%" innerRadius={32} outerRadius={48} strokeWidth={2}>
                    {data.dept_hours.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={6} wrapperStyle={{ paddingTop: 4 }}
                    formatter={(v) => <span style={{ fontSize: 9, color: "var(--tx-2)" }}>{v}</span>} />
                  <Tooltip
                    formatter={(v) => [`${Number(v).toFixed(0)}h`, "Hours"]}
                    contentStyle={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 8, fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Right mini-stats column */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.19 }}
          className="flex flex-col gap-3"
          style={{ width: 148 }}
        >
          {[
            { icon: CheckCircle, label: "Approved",    value: kpis?.approved_this_month ?? 0, accent: "#10B981", sub: "This month" },
            { icon: XCircle,     label: "Rejected",    value: kpis?.rejected_this_month  ?? 0, accent: "#EF4444", sub: "This month" },
            { icon: Zap,         label: "Avg Hrs/Emp", value: `${Number(kpis?.avg_hours_per_employee || 0).toFixed(1)}h`, accent: "#F59E0B", sub: "This month" },
          ].map(({ icon: Icon, label, value, accent, sub }, i) => (
            <div key={label}
              className="rounded-xl px-3 py-2.5 flex items-center gap-2.5 flex-1"
              style={S.card}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${accent}18` }}>
                <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide" style={S.tx3}>{label}</p>
                <p className="text-lg font-bold leading-tight tabular-nums" style={S.tx1}>{value}</p>
                <p className="text-[9px]" style={S.tx3}>{sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── ROW 3 — Top Projects + Pending Approvals (flex, fill remaining) */}
      <div className="flex gap-3 flex-1 min-h-0">

        {/* Top Projects */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="rounded-xl overflow-hidden flex flex-col"
          style={{ ...S.card, flex: "0 0 55%" }}
        >
          <div className="px-4 py-2.5 flex items-center justify-between flex-shrink-0" style={S.hdr}>
            <div className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#10B981" }} />
              <span className="text-xs font-semibold" style={S.tx1}>Top Projects by Hours</span>
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>Last 90 days</span>
            </div>
            <motion.button
              onClick={() => navigate("/projects")}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1 text-[10px] font-semibold"
              style={{ color: "#2563EB" }}
            >
              All <ArrowRight className="h-3 w-3" />
            </motion.button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 animate-pulse rounded-lg" style={{ background: "var(--surface-2)" }} />
                ))}
              </div>
            ) : (data?.top_projects?.length ?? 0) === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8">
                <Briefcase className="h-5 w-5 mb-2" style={{ color: "var(--tx-3)" }} />
                <p className="text-xs" style={S.tx3}>No project data yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--surface-border)" }}>
                    {["#","Project","Customer","Hrs","Emp"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-[9px] font-semibold uppercase tracking-wider"
                        style={S.tx3}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.top_projects.slice(0, 7).map((proj, i) => {
                    const pct = Math.round((proj.total_hours / maxProjHours) * 100);
                    return (
                      <motion.tr
                        key={proj.project_name}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 + i * 0.03 }}
                        style={{ borderBottom: "1px solid var(--surface-border)" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td className="px-3 py-2 w-8">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold"
                            style={{
                              background: i < 3 ? RANK_BG[i] : "var(--surface-2)",
                              color: i < 3 ? RANK_CO[i] : "var(--tx-3)",
                            }}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-3 py-2 max-w-[140px]">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold truncate" style={S.tx1} title={proj.project_name}>
                              {proj.project_name}
                            </span>
                            <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--surface-border)", width: `${pct}%`, minWidth: 4 }}>
                              <div className="h-full rounded-full" style={{ background: DEPT_COLORS[i % DEPT_COLORS.length], width: "100%" }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--tx-2)" }}>
                            {proj.customer_name.length > 12 ? proj.customer_name.slice(0,12)+"…" : proj.customer_name}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs font-bold tabular-nums" style={S.tx1}>{proj.total_hours.toFixed(0)}h</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs font-semibold tabular-nums" style={{ color: "#2563EB" }}>{proj.employee_count}</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.23 }}
          className="rounded-xl overflow-hidden flex flex-col flex-1"
          style={S.card}
        >
          <div className="px-4 py-2.5 flex items-center justify-between flex-shrink-0" style={S.hdr}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#F59E0B" }} />
              <span className="text-xs font-semibold" style={S.tx1}>Pending Approvals</span>
              {(kpis?.pending_approvals ?? 0) > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                  style={{ background: "#F59E0B" }}>{kpis.pending_approvals}</span>
              )}
            </div>
            <motion.button
              onClick={() => navigate("/approvals")}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1 text-[10px] font-semibold"
              style={{ color: "#2563EB" }}
            >
              All <ArrowRight className="h-3 w-3" />
            </motion.button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {(!data?.pending_approvals || data.pending_approvals.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center"
                  style={{ background: "rgba(16,185,129,0.1)" }}>
                  <CheckCircle className="h-4 w-4" style={{ color: "#10B981" }} />
                </div>
                <p className="text-xs font-medium" style={S.tx2}>All caught up!</p>
                <p className="text-[10px] mt-0.5" style={S.tx3}>No pending timesheets</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--surface-border)" }}>
                    {["Employee","Week","Hrs","Action"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-[9px] font-semibold uppercase tracking-wider"
                        style={S.tx3}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.pending_approvals.map((item, i) => (
                    <motion.tr
                      key={item.header_id}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ borderBottom: "1px solid var(--surface-border)" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#2563EB,#10B981)" }}>
                            {(item.employee_name || "U").charAt(0)}
                          </div>
                          <span className="text-xs font-medium truncate max-w-[90px]" style={S.tx1} title={item.employee_name}>
                            {item.employee_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-[10px]" style={S.tx3}>
                          {item.week_label?.split(" - ")[0]}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs font-bold tabular-nums" style={S.tx1}>{item.total_hours}h</span>
                      </td>
                      <td className="px-3 py-2">
                        <motion.button
                          onClick={() => navigate("/approvals")}
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white"
                          style={{ background: "linear-gradient(135deg,#2563EB,#10B981)" }}
                        >
                          Review
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
