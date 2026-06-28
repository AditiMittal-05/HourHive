import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Camera, User, Settings, Bell, Palette, Edit3, Save, Check,
  ChevronDown, Lock, Key, Activity, Users, Clock, CheckCircle,
  AlertTriangle, Zap, Database, Server, BarChart2, Sun, Moon,
  ArrowRight, RefreshCw, LogOut, Search, X, MapPin, Mail, Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { useAdminProfileStore } from "@/store/admin-profile.store";
import { useThemeStore } from "@/store/theme.store";
import { usersService } from "@/services/users.service";
import { format } from "date-fns";

/* ── Design tokens — same palette as employee pages ─────────────── */
const P  = "#2563EB";   // royal blue
const P2 = "#1D4ED8";   // blue dark
const G  = "#10B981";   // emerald
const HERO_GRAD = "linear-gradient(135deg,#1E3A8A 0%,#1D4ED8 40%,#0D9488 100%)";

const S = {
  card:      { background: "var(--surface)", border: "1px solid var(--surface-border)", boxShadow: "var(--card-shadow)" },
  cardHead:  { background: "var(--surface-2)", borderBottom: "1px solid var(--surface-border)" },
  subRow:    { background: "var(--surface-2)", border: "1px solid var(--surface-border)" },
  tx1: { color: "var(--tx-1)" },
  tx2: { color: "var(--tx-2)" },
  tx3: { color: "var(--tx-3)" },
  inp: (focused) => ({
    background: focused ? "var(--surface-3)" : "var(--surface-2)",
    border: focused ? `1px solid ${P}` : "1px solid var(--inp-border)",
    boxShadow: focused ? `0 0 0 3px rgba(37,99,235,0.12)` : "none",
    color: "var(--tx-1)",
  }),
};

const TABS = [
  { id: "overview",      label: "Overview",       icon: BarChart2  },
  { id: "identity",      label: "Admin Identity", icon: Shield     },
  { id: "access",        label: "Access",         icon: Lock       },
  { id: "notifications", label: "Notifications",  icon: Bell       },
  { id: "appearance",    label: "Appearance",     icon: Palette    },
  { id: "audit",         label: "Audit",          icon: Activity   },
];

const PERMISSIONS = [
  { label: "Full System Access",     desc: "Read/write on all modules",              icon: Database    },
  { label: "User Management",        desc: "Create, edit, delete any user account",  icon: Users       },
  { label: "Approve Timesheets",     desc: "Approve or reject submissions",          icon: CheckCircle },
  { label: "Audit Log Access",       desc: "View complete audit trail",              icon: Shield      },
  { label: "Organisation Settings",  desc: "Configure hierarchy & mappings",         icon: Settings    },
  { label: "Holiday Management",     desc: "Add/edit company holidays",             icon: Clock       },
  { label: "Project Management",     desc: "Create and manage all projects",         icon: Zap         },
  { label: "System Configuration",   desc: "Modify global application settings",    icon: Server      },
];

const RECENT_AUDIT = [
  { action: "Approved timesheet for Priya Sharma",  time: "2 hrs ago",  icon: CheckCircle, color: G       },
  { action: "Added new user: Rahul Verma",          time: "4 hrs ago",  icon: Users,       color: P       },
  { action: "Created project: ERP Phase 3",         time: "Yesterday",  icon: Zap,         color: "#8B5CF6" },
  { action: "Modified approver mapping",            time: "2 days ago", icon: Settings,    color: "#F59E0B" },
  { action: "Rejected timesheet: missing entries",  time: "3 days ago", icon: AlertTriangle,color:"#EF4444" },
];

/* ── Reusable sub-components ──────────────────────────────────────── */
function AdminCard({ children, className = "" }) {
  return <div className={`rounded-2xl overflow-hidden ${className}`} style={S.card}>{children}</div>;
}

function AdminCardHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between" style={S.cardHead}>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${P}18` }}>
          {Icon && <Icon className="h-3.5 w-3.5" style={{ color: P }} />}
        </div>
        <div>
          <p className="text-sm font-semibold" style={S.tx1}>{title}</p>
          {subtitle && <p className="text-[10px] mt-0.5" style={S.tx3}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function FLabel({ children }) {
  return <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={S.tx3}>{children}</p>;
}

function ThemedInput({ value, onChange, placeholder, type = "text", readOnly = false, ...rest }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      readOnly={readOnly}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none transition-all"
      style={{ ...S.inp(focused && !readOnly), cursor: readOnly ? "default" : "text", opacity: readOnly ? 0.6 : 1 }}
      {...rest}
    />
  );
}

function GradBtn({ children, onClick, small = false, color = "blue", disabled = false }) {
  const bg = color === "green"
    ? "linear-gradient(135deg,#10B981,#059669)"
    : `linear-gradient(135deg,${P},${P2})`;
  return (
    <motion.button onClick={onClick} disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.04 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      className={`flex items-center gap-1.5 rounded-xl font-semibold text-white transition-all ${small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}`}
      style={{
        background: disabled ? "var(--surface-3)" : bg,
        color: disabled ? "var(--tx-3)" : "#fff",
        boxShadow: disabled ? "none" : "0 2px 10px rgba(37,99,235,0.3)",
      }}
    >
      {children}
    </motion.button>
  );
}

function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b last:border-0"
      style={{ borderColor: "var(--surface-border)" }}>
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium" style={S.tx1}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={S.tx2}>{description}</p>}
      </div>
      <motion.button onClick={() => onChange(!checked)}
        className="flex-shrink-0 relative rounded-full transition-colors duration-200"
        style={{
          width: 48, height: 26,
          background: checked ? `linear-gradient(135deg,${P},${G})` : "var(--surface-3)",
          border: checked ? "none" : "1px solid var(--surface-border)",
        }}
      >
        <motion.span
          animate={{ x: checked ? 25 : 3 }}
          transition={{ type: "spring", stiffness: 600, damping: 35 }}
          style={{
            position: "absolute", top: 3, left: 0, width: 20, height: 20,
            borderRadius: "50%", background: "#FFFFFF",
            boxShadow: checked ? "0 2px 6px rgba(37,99,235,0.35)" : "0 1px 4px rgba(0,0,0,0.18)",
          }}
        />
      </motion.button>
    </div>
  );
}

/* ── Switch Super Admin Modal ─────────────────────────────────────── */
function SwitchAdminModal({ onClose }) {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-dropdown"],
    queryFn: usersService.dropdown,
  });
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState("pick"); // "pick" | "confirm" | "done"
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState("");

  const filtered = users.filter((u) =>
    u.role !== "super_admin" &&
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleTransfer = async () => {
    if (!selected) return;
    setTransferring(true);
    setError("");
    try {
      await usersService.update(selected.id, { role: "super_admin" });
      setStep("done");
    } catch (e) {
      setError(e?.response?.data?.message || "Transfer failed. Please try again.");
    } finally {
      setTransferring(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md rounded-3xl overflow-hidden relative"
        style={S.card}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{
          background: HERO_GRAD,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)" }}>
              <RefreshCw className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Switch Super Admin</p>
              <p className="text-[10px] text-white/60">Transfer administrative privileges</p>
            </div>
          </div>
          {step !== "done" && (
            <motion.button onClick={onClose} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.1)" }}>
              <X className="h-3.5 w-3.5 text-white" />
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">

          {/* Step 1: pick user */}
          {step === "pick" && (
            <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* warning banner */}
              <div className="mx-5 mt-5 p-3 rounded-xl flex items-start gap-2.5"
                style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#EF4444" }} />
                <p className="text-xs leading-relaxed" style={{ color: "#EF4444" }}>
                  This will permanently transfer Super Admin privileges. Your account will be downgraded and you will be logged out.
                </p>
              </div>

              {/* search */}
              <div className="px-5 pt-4 pb-2">
                <p className="text-xs font-semibold mb-2" style={S.tx3}>Select a user to promote</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={S.tx3} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ background: "var(--surface-2)", border: `1px solid var(--surface-border)`, color: "var(--tx-1)" }}
                    autoFocus
                  />
                </div>
              </div>

              {/* user list */}
              <div className="px-5 pb-2 max-h-56 overflow-y-auto space-y-1 scrollbar-thin">
                {isLoading ? (
                  <div className="py-6 text-center text-xs" style={S.tx3}>Loading users…</div>
                ) : filtered.length === 0 ? (
                  <div className="py-6 text-center text-xs" style={S.tx3}>No employees found</div>
                ) : filtered.map((u) => (
                  <motion.button
                    key={u.id}
                    onClick={() => setSelected(u)}
                    whileHover={{ x: 2 }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                    style={selected?.id === u.id
                      ? { background: `${P}12`, border: `1px solid ${P}30` }
                      : { background: "transparent", border: "1px solid transparent" }
                    }
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#2563EB,#10B981)" }}>
                      {u.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={S.tx1}>{u.full_name}</p>
                      <p className="text-xs truncate" style={S.tx3}>{u.email}</p>
                    </div>
                    {selected?.id === u.id && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: P }}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="px-5 py-4 flex items-center justify-end gap-2"
                style={{ borderTop: "1px solid var(--surface-border)" }}>
                <motion.button onClick={onClose} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={S.subRow}>
                  Cancel
                </motion.button>
                <GradBtn onClick={() => selected && setStep("confirm")} disabled={!selected}>
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </GradBtn>
              </div>
            </motion.div>
          )}

          {/* Step 2: confirm */}
          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#2563EB,#10B981)" }}>
                    {selected?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-base font-bold" style={S.tx1}>{selected?.full_name}</p>
                  <p className="text-xs mt-0.5" style={S.tx3}>{selected?.email}</p>
                </div>

                <div className="space-y-2 text-sm">
                  {[
                    { icon: CheckCircle, color: G,       text: `${selected?.full_name} will become Super Admin` },
                    { icon: LogOut,      color: "#EF4444", text: "You will be downgraded to Employee" },
                    { icon: AlertTriangle,color: "#F59E0B",text: "You will be logged out immediately" },
                    { icon: Shield,      color: P,        text: "This action cannot be undone" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={S.subRow}>
                      <item.icon className="h-4 w-4 flex-shrink-0" style={{ color: item.color }} />
                      <p style={S.tx2}>{item.text}</p>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="p-3 rounded-xl flex items-center gap-2"
                    style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" style={{ color: "#EF4444" }} />
                    <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>
                  </div>
                )}
              </div>

              <div className="px-6 pb-5 flex items-center justify-between">
                <motion.button onClick={() => setStep("pick")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5"
                  style={S.subRow}>
                  ← Back
                </motion.button>
                <motion.button
                  onClick={handleTransfer}
                  disabled={transferring}
                  whileHover={transferring ? {} : { scale: 1.04 }}
                  whileTap={transferring ? {} : { scale: 0.96 }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
                  style={{
                    background: transferring ? "var(--surface-3)" : "linear-gradient(135deg,#EF4444,#DC2626)",
                    boxShadow: transferring ? "none" : "0 2px 10px rgba(239,68,68,0.3)",
                    color: transferring ? "var(--tx-3)" : "#fff",
                  }}
                >
                  {transferring ? (
                    <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Transferring…</>
                  ) : (
                    <><Shield className="h-3.5 w-3.5" /> Confirm Transfer</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: done */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#10B981,#059669)", boxShadow: "0 8px 24px rgba(16,185,129,0.4)" }}
              >
                <Check className="h-8 w-8 text-white" />
              </motion.div>
              <p className="text-base font-bold mb-1" style={S.tx1}>Transfer Complete!</p>
              <p className="text-sm mb-1" style={S.tx2}>
                <span className="font-semibold">{selected?.full_name}</span> is now Super Admin.
              </p>
              <p className="text-xs mb-6" style={S.tx3}>
                Your session will end. Please log back in if needed.
              </p>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 mx-auto"
                style={{ background: `linear-gradient(135deg,${P},${G})`, boxShadow: `0 4px 16px rgba(37,99,235,0.3)` }}
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────── */
export default function SuperAdminProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    avatar, bio, phone, location, linkedin, github, portfolio,
    timezone, language, notifyApprovals, notifySystemAlerts,
    notifyNewUsers, notifyWeeklyReport,
    setAvatar, setBio, patch,
  } = useAdminProfileStore();
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [tab, setTab]               = useState("overview");
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput]     = useState(bio);
  const [saved, setSaved]           = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const avatarRef = useRef(null);

  const initials    = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "SA";
  const memberSince = user?.created_at ? format(new Date(user.created_at), "MMM yyyy") : "N/A";

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };

  return (
    <>
      {/* Switch Admin Modal */}
      <AnimatePresence>
        {showSwitch && (
          <SwitchAdminModal onClose={() => setShowSwitch(false)} />
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto flex flex-col" style={{ height: "calc(100vh - 64px - 48px)" }}>

        {/* ═══ HERO ══════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="relative rounded-2xl overflow-hidden flex-shrink-0 mb-3"
          style={{ background: HERO_GRAD, boxShadow: "0 8px 40px rgba(37,99,235,0.3)" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"
            style={{ background: "radial-gradient(circle,#60A5FA,transparent)" }} />
          <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full opacity-10 translate-y-1/2 pointer-events-none"
            style={{ background: "radial-gradient(circle,#34D399,transparent)" }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.4),rgba(16,185,129,0.3),transparent)" }} />

          <div className="relative px-6 py-4">
            <div className="flex items-center gap-5">
              {/* LEFT: info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.15)" }}>
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    Super Admin Profile
                  </span>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl font-bold text-white leading-tight">{user?.full_name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
                    👑 Super Admin
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-1 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 flex-shrink-0" />{user?.email}
                </p>
                {user?.department && (
                  <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 flex-shrink-0" />{user.department}
                  </p>
                )}
                {bio && <p className="text-xs text-white/60 mt-1.5 max-w-md line-clamp-1">{bio}</p>}
                {/* stats + completion bar */}
                <div className="flex items-center gap-4 mt-2.5">
                  {[
                    { val: "∞",         label: "Permissions" },
                    { val: memberSince, label: "Since" },
                    { val: "Active",    label: "Status" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-white">{s.val}</span>
                      <span className="text-[10px] text-white/50">{s.label}</span>
                    </div>
                  ))}
                  <div className="flex-1 ml-2">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: "100%" }}
                        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.4 }}
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg,#FFFFFF,rgba(255,255,255,0.7))" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-bold text-white"
                  style={{
                    background: avatar ? "transparent" : `linear-gradient(135deg,${P},${G})`,
                    boxShadow: "0 0 0 3px rgba(255,255,255,0.2),0 6px 24px rgba(0,0,0,0.3)",
                  }}>
                  {avatar ? <img src={avatar} alt="av" className="w-full h-full object-cover" /> : initials}
                </div>
                <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
                  onClick={() => avatarRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xl"
                  style={{ background: `linear-gradient(135deg,${P},${G})`, border: "2px solid rgba(255,255,255,0.3)" }}>
                  <Camera className="h-3.5 w-3.5" />
                </motion.button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ TABS ══════════════════════════════════════════════ */}
        <div className="flex gap-0.5 p-1 rounded-xl overflow-x-auto scrollbar-thin flex-shrink-0 mb-3" style={S.card}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <motion.button key={id} onClick={() => setTab(id)}
                className="flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative"
                style={{ color: active ? "#fff" : "var(--tx-3)" }}
              >
                {active && (
                  <motion.div layoutId="admin-tab-pill" className="absolute inset-0 rounded-lg"
                    style={{ background: `linear-gradient(135deg,${P},${P2})`, boxShadow: `0 2px 8px rgba(37,99,235,0.3)` }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }} />
                )}
                <Icon className="h-3.5 w-3.5 relative z-10 flex-shrink-0" />
                <span className="relative z-10 hidden md:block whitespace-nowrap">{label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* ═══ CONTENT ═══════════════════════════════════════════ */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin rounded-2xl">
          <AnimatePresence mode="wait">

            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
              <motion.div key="ov" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="space-y-3 pb-3">

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: Users,        accent: P,        label: "Total Employees",    val: "—" },
                    { icon: CheckCircle,  accent: G,        label: "Approved / Month",   val: "—" },
                    { icon: Zap,          accent: "#8B5CF6", label: "Active Projects",   val: "—" },
                    { icon: Shield,       accent: "#F59E0B", label: "Audit Events Today", val: "—" },
                  ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-xl p-3 flex items-center gap-3" style={S.card}>
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                        style={{ background: `${s.accent}18` }}>
                        <s.icon className="h-4 w-4" style={{ color: s.accent }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium" style={S.tx3}>{s.label}</p>
                        <p className="text-sm font-bold" style={S.tx1}>{s.val}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <AdminCard>
                    <AdminCardHeader icon={Shield} title="Admin Identity" />
                    <div className="p-3 space-y-2.5">
                      {[
                        { icon: User,   label: "Full Name",    val: user?.full_name },
                        { icon: Mail,   label: "Email",        val: user?.email },
                        { icon: Shield, label: "Role",         val: "Super Administrator" },
                        { icon: MapPin, label: "Department",   val: user?.department || "—" },
                        { icon: Globe,  label: "Language",     val: language },
                        { icon: Clock,  label: "Member Since", val: memberSince },
                      ].map((r) => (
                        <div key={r.label} className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ background: `${P}18` }}>
                            <r.icon className="h-3 w-3" style={{ color: P }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-wider" style={S.tx3}>{r.label}</p>
                            <p className="text-xs font-medium truncate" style={S.tx1}>
                              {r.val || <span className="italic" style={S.tx3}>Not set</span>}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AdminCard>

                  <AdminCard className="md:col-span-2">
                    <AdminCardHeader icon={Edit3} title="About & Bio"
                      action={
                        editingBio
                          ? <GradBtn small color="green" onClick={() => { setBio(bioInput); setEditingBio(false); }}>
                              <Check className="h-3 w-3" />Save
                            </GradBtn>
                          : <GradBtn small onClick={() => { setBioInput(bio); setEditingBio(true); }}>
                              <Edit3 className="h-3 w-3" />Edit
                            </GradBtn>
                      }
                    />
                    <div className="p-4 space-y-3">
                      {editingBio ? (
                        <textarea value={bioInput} onChange={(e) => setBioInput(e.target.value)} rows={3}
                          placeholder="Write something about your role and responsibilities…"
                          className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none resize-none transition-all"
                          style={{ background: "var(--surface-2)", border: `1px solid ${P}`, boxShadow: `0 0 0 3px rgba(37,99,235,0.1)`, color: "var(--tx-1)" }}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed" style={S.tx2}>
                          {bio || <span className="italic" style={S.tx3}>No bio yet. Click Edit to add one.</span>}
                        </p>
                      )}

                      <div className="flex items-start gap-3 p-3 rounded-xl"
                        style={{ background: `${P}08`, border: `1px solid ${P}20` }}>
                        <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: P }} />
                        <div>
                          <p className="text-xs font-semibold" style={{ color: P }}>Permanent Account</p>
                          <p className="text-xs mt-0.5" style={S.tx3}>
                            Super Admin accounts have permanent full-system access and cannot be deleted.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "System", val: "Healthy", color: G },
                          { label: "DB",     val: "Online",  color: G },
                          { label: "API",    val: "200 OK",  color: G },
                        ].map((s) => (
                          <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={S.subRow}>
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                            <div>
                              <p className="text-[9px]" style={S.tx3}>{s.label}</p>
                              <p className="text-xs font-semibold" style={{ color: s.color }}>{s.val}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AdminCard>
                </div>

                <AdminCard>
                  <AdminCardHeader icon={Activity} title="Recent Actions" subtitle="Your last 5 admin activities" />
                  <div className="p-2 space-y-0.5">
                    {RECENT_AUDIT.map((item, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-default"
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-3)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${item.color}18` }}>
                          <item.icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                        </div>
                        <p className="flex-1 text-xs font-medium" style={S.tx1}>{item.action}</p>
                        <p className="text-[10px] flex-shrink-0" style={S.tx3}>{item.time}</p>
                      </motion.div>
                    ))}
                  </div>
                </AdminCard>
              </motion.div>
            )}

            {/* ── ADMIN IDENTITY ── */}
            {tab === "identity" && (
              <motion.div key="id" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="space-y-3 pb-3">
                <AdminCard>
                  <AdminCardHeader icon={User} title="Contact Information" subtitle="Your personal & contact details"
                    action={<GradBtn small onClick={handleSave}>{saved ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}{saved ? "Saved!" : "Save"}</GradBtn>}
                  />
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><FLabel>Full Name</FLabel><ThemedInput value={user?.full_name || ""} readOnly placeholder="Full name" /></div>
                    <div><FLabel>Email Address</FLabel><ThemedInput value={user?.email || ""} readOnly placeholder="Email" /></div>
                    <div>
                      <FLabel>Phone Number</FLabel>
                      <ThemedInput value={phone} onChange={(e) => patch({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit mobile number" />
                    </div>
                    <div>
                      <FLabel>Location</FLabel>
                      <ThemedInput value={location} onChange={(e) => patch({ location: e.target.value })} placeholder="City, Country" />
                    </div>
                    <div>
                      <FLabel>Language</FLabel>
                      <select value={language} onChange={(e) => patch({ language: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none transition-all"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--inp-border)", color: "var(--tx-1)" }}>
                        {["English","Hindi","Spanish","French","German","Japanese","Mandarin"].map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <FLabel>Timezone</FLabel>
                      <select value={timezone} onChange={(e) => patch({ timezone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none transition-all"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--inp-border)", color: "var(--tx-1)" }}>
                        {["Asia/Kolkata","America/New_York","America/Los_Angeles","Europe/London","Europe/Berlin","Asia/Tokyo","Australia/Sydney"].map((tz) => <option key={tz}>{tz}</option>)}
                      </select>
                    </div>
                  </div>
                </AdminCard>
                <AdminCard>
                  <AdminCardHeader icon={Globe} title="Social & Professional Links" />
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "linkedin",  label: "LinkedIn URL",  placeholder: "linkedin.com/in/username", val: linkedin  },
                      { key: "github",    label: "GitHub URL",    placeholder: "github.com/username",      val: github    },
                      { key: "portfolio", label: "Portfolio URL", placeholder: "yoursite.com",             val: portfolio },
                    ].map(({ key, label, placeholder, val }) => (
                      <div key={key}>
                        <FLabel>{label}</FLabel>
                        <ThemedInput value={val || ""} onChange={(e) => patch({ [key]: e.target.value })} placeholder={placeholder} />
                      </div>
                    ))}
                  </div>
                </AdminCard>
              </motion.div>
            )}

            {/* ── ACCESS & PERMISSIONS ── */}
            {tab === "access" && (
              <motion.div key="ac" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="space-y-3 pb-3">

                <AdminCard>
                  <AdminCardHeader icon={Shield} title="Permissions"
                    subtitle="All permissions permanently granted to Super Admin" />
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PERMISSIONS.map((p, i) => (
                      <motion.div key={p.label}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-start gap-3 p-3 rounded-xl" style={S.subRow}>
                        <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                          style={{ background: `${P}15` }}>
                          <p.icon className="h-4 w-4" style={{ color: P }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold" style={S.tx1}>{p.label}</p>
                          <p className="text-[10px] mt-0.5" style={S.tx3}>{p.desc}</p>
                        </div>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(16,185,129,0.15)" }}>
                          <CheckCircle className="h-3.5 w-3.5" style={{ color: G }} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AdminCard>

                {/* Security */}
                <AdminCard>
                  <AdminCardHeader icon={Key} title="Security" />
                  <div className="p-4 space-y-2.5">
                    <motion.button onClick={() => navigate("/change-password")}
                      whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                      style={S.subRow}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${P}15` }}>
                          <Key className="h-4 w-4" style={{ color: P }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={S.tx1}>Change Password</p>
                          <p className="text-xs" style={S.tx3}>Update your account password</p>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 -rotate-90" style={S.tx3} />
                    </motion.button>
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: "rgba(239,68,68,0.1)" }}>
                          <Lock className="h-4 w-4" style={{ color: "#EF4444" }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#EF4444" }}>Account Deletion</p>
                          <p className="text-xs" style={S.tx3}>Super Admin accounts are protected from deletion</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>Protected</span>
                    </div>
                  </div>
                </AdminCard>

                {/* Switch Super Admin */}
                <AdminCard>
                  <AdminCardHeader icon={RefreshCw} title="Switch Super Admin"
                    subtitle="Transfer the Super Admin role to another employee" />
                  <div className="p-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl"
                      style={{ background: "rgba(37,99,235,0.05)", border: `1px solid rgba(37,99,235,0.15)` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${P}15` }}>
                        <RefreshCw className="h-5 w-5" style={{ color: P }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold mb-1" style={S.tx1}>Transfer Administrative Control</p>
                        <p className="text-xs leading-relaxed mb-3" style={S.tx3}>
                          You can transfer the Super Admin role to any existing employee. Once transferred, you will be demoted to a regular employee and automatically signed out.
                          This action <strong style={{ color: "#EF4444" }}>cannot be undone</strong> without the new admin's action.
                        </p>
                        <div className="flex items-center gap-2 text-xs mb-4" style={S.tx3}>
                          {[
                            { icon: CheckCircle, color: G,        text: "Promotes selected user to Super Admin" },
                            { icon: AlertTriangle,color:"#EF4444", text: "You become a regular employee" },
                            { icon: LogOut,      color:"#F59E0B",  text: "Your session ends immediately" },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <item.icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: item.color }} />
                              <span>{item.text}</span>
                              {i < 2 && <span className="mx-1 opacity-30">·</span>}
                            </div>
                          ))}
                        </div>
                        <motion.button
                          onClick={() => setShowSwitch(true)}
                          whileHover={{ scale: 1.03, boxShadow: `0 6px 20px rgba(37,99,235,0.25)` }}
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                          style={{ background: `linear-gradient(135deg,${P},${G})`, boxShadow: `0 2px 10px rgba(37,99,235,0.3)` }}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Switch Super Admin
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </AdminCard>
              </motion.div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {tab === "notifications" && (
              <motion.div key="no" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="space-y-3 pb-3">
                <AdminCard>
                  <AdminCardHeader icon={Bell} title="Notification Preferences" subtitle="Choose which alerts you receive" />
                  <div className="px-4">
                    <ToggleSwitch label="Approval Requests"       description="Notify when employees submit timesheets for approval" checked={notifyApprovals}     onChange={(v) => patch({ notifyApprovals: v })} />
                    <ToggleSwitch label="System Alerts"           description="Critical alerts about platform health and errors"      checked={notifySystemAlerts} onChange={(v) => patch({ notifySystemAlerts: v })} />
                    <ToggleSwitch label="New User Registrations"  description="Get notified when a new employee account is created"  checked={notifyNewUsers}     onChange={(v) => patch({ notifyNewUsers: v })} />
                    <ToggleSwitch label="Weekly Summary Report"   description="Receive a weekly digest of org-wide timesheet activity" checked={notifyWeeklyReport} onChange={(v) => patch({ notifyWeeklyReport: v })} />
                  </div>
                </AdminCard>
              </motion.div>
            )}

            {/* ── APPEARANCE ── */}
            {tab === "appearance" && (
              <motion.div key="ap" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="space-y-3 pb-3">
                <AdminCard>
                  <AdminCardHeader icon={Palette} title="Theme & Appearance" />
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "light",  label: "Light",  icon: Sun,      desc: "Clean light interface" },
                        { id: "dark",   label: "Dark",   icon: Moon,     desc: "Easy on the eyes" },
                        { id: "system", label: "System", icon: Settings, desc: "Follow OS preference" },
                      ].map(({ id, label, icon: Icon, desc }) => (
                        <motion.button key={id} onClick={() => setTheme(id)}
                          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                          style={theme === id
                            ? { background: `${P}15`, border: `2px solid ${P}`, boxShadow: `0 4px 16px ${P}22` }
                            : { ...S.subRow, border: "2px solid transparent" }
                          }
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: theme === id ? `${P}20` : "var(--surface-3)" }}>
                            <Icon className="h-5 w-5" style={{ color: theme === id ? P : "var(--tx-3)" }} />
                          </div>
                          <p className="text-sm font-semibold" style={{ color: theme === id ? P : "var(--tx-1)" }}>{label}</p>
                          <p className="text-[10px] text-center" style={S.tx3}>{desc}</p>
                        </motion.button>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl flex items-center gap-3"
                      style={{ background: `${P}08`, border: `1px solid ${P}20` }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${P}18` }}>
                        {isDark ? <Moon className="h-4 w-4" style={{ color: P }} /> : <Sun className="h-4 w-4" style={{ color: P }} />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: P }}>
                          Currently using {isDark ? "Dark" : "Light"} theme
                        </p>
                        <p className="text-xs mt-0.5" style={S.tx3}>You can also toggle from the top navigation bar</p>
                      </div>
                    </div>
                  </div>
                </AdminCard>
              </motion.div>
            )}

            {/* ── AUDIT SUMMARY ── */}
            {tab === "audit" && (
              <motion.div key="au" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="space-y-3 pb-3">

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: Activity,     accent: P,        label: "Actions Today",  val: "—" },
                    { icon: Users,        accent: G,        label: "Users Modified", val: "—" },
                    { icon: CheckCircle,  accent: G,        label: "Approved",       val: "—" },
                    { icon: AlertTriangle,accent: "#EF4444", label: "Rejected",      val: "—" },
                  ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-xl p-3 flex items-center gap-3" style={S.card}>
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                        style={{ background: `${s.accent}18` }}>
                        <s.icon className="h-4 w-4" style={{ color: s.accent }} />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium" style={S.tx3}>{s.label}</p>
                        <p className="text-sm font-bold" style={S.tx1}>{s.val}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <AdminCard>
                  <AdminCardHeader icon={Activity} title="Recent Admin Activity"
                    action={
                      <motion.button onClick={() => navigate("/audit-logs")}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: `${P}12`, color: P, border: `1px solid ${P}28` }}>
                        View Full Log <ArrowRight className="h-3 w-3" />
                      </motion.button>
                    }
                  />
                  <div className="p-2 space-y-0.5">
                    {RECENT_AUDIT.map((item, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-3)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${item.color}18` }}>
                          <item.icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                        </div>
                        <p className="flex-1 text-xs font-medium" style={S.tx1}>{item.action}</p>
                        <p className="text-[10px] flex-shrink-0" style={S.tx3}>{item.time}</p>
                      </motion.div>
                    ))}
                  </div>
                </AdminCard>

                <div className="p-4 rounded-2xl flex items-start gap-3"
                  style={{ background: `${P}08`, border: `1px solid ${P}20` }}>
                  <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: P }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: P }}>Full Audit Trail Available</p>
                    <p className="text-xs mt-0.5" style={S.tx3}>
                      All admin actions are permanently logged. Go to Audit Logs for a searchable, filterable history.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
