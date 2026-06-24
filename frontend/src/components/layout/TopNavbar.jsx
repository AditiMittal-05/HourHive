import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Menu, Bell, Search, LogOut, Key, ChevronDown, ChevronRight, Shield } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/utils/cn";

const breadcrumbMap = {
  "/dashboard": "Dashboard",
  "/timesheets": "My Timesheets",
  "/timesheets/entry": "Log Time",
  "/timesheets/weekly": "Weekly View",
  "/approvals": "Approval Queue",
  "/users": "User Management",
  "/organization": "Org Hierarchy",
  "/approver-mapping": "Approver Mapping",
  "/projects": "Project Management",
  "/activities": "Activity Management",
  "/reports": "Reports",
  "/analytics": "Analytics",
  "/change-password": "Change Password",
  "/audit-logs": "Audit Logs",
  "/holidays": "Holiday Management",
};

const ROLE_COLORS = {
  super_admin: { bg: "rgba(217,119,6,0.12)", color: "#92400E", label: "Super Admin" },
  employee: { bg: "rgba(20,87,232,0.10)", color: "#1457E8", label: "Employee" },
};

export function TopNavbar({ onMenuToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { user, logout } = useAuthStore();

  const pageTitle = breadcrumbMap[location.pathname] || "HourHive";
  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";
  const isSuperAdmin = user?.role === "super_admin";
  const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.employee;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-border-color flex items-center px-5 gap-4 sticky top-0 z-30"
      style={{ boxShadow: "0 1px 0 0 #D9E5FF" }}>

      {/* Sidebar toggle */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-50 transition-colors flex-shrink-0"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm min-w-0">
        <span className="text-text-secondary font-medium hidden sm:block">HourHive</span>
        <ChevronRight className="h-3.5 w-3.5 text-text-secondary/50 hidden sm:block flex-shrink-0" />
        <span className="font-semibold text-text-primary truncate">{pageTitle}</span>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className={cn(
            "pl-9 pr-4 h-9 rounded-lg border border-border-color bg-light-bg text-sm text-text-primary",
            "placeholder:text-text-secondary/70",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white",
            "transition-all duration-200",
            "w-52 focus:w-72"
          )}
        />
      </div>

      {/* Notification bell */}
      <button className="relative p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-50 transition-colors flex-shrink-0">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-white" />
      </button>

      {/* User menu */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setMenuOpen((p) => !p)}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-light-bg transition-colors"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{
              background: isSuperAdmin
                ? "linear-gradient(135deg, #D97706 0%, #B45309 100%)"
                : "linear-gradient(135deg, #1457E8 0%, #0A2EAA 100%)"
            }}
          >
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-text-primary leading-none">{user?.full_name}</p>
            <p className="text-xs mt-0.5" style={{ color: roleStyle.color }}>
              {isSuperAdmin ? "Super Admin" : user?.can_approve_timesheets ? "Approver" : "Employee"}
            </p>
          </div>
          <ChevronDown className={cn(
            "h-3.5 w-3.5 text-text-secondary transition-transform duration-200",
            menuOpen && "rotate-180"
          )} />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-12 w-60 bg-white rounded-xl border border-border-color z-50 overflow-hidden animate-scale-in"
              style={{ boxShadow: "0 8px 32px -4px rgba(20, 87, 232, 0.18), 0 2px 8px -2px rgba(20, 87, 232, 0.08)" }}>

              {/* User info header */}
              <div className="px-4 py-3.5 border-b border-border-color bg-light-bg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{
                      background: isSuperAdmin
                        ? "linear-gradient(135deg, #D97706 0%, #B45309 100%)"
                        : "linear-gradient(135deg, #1457E8 0%, #0A2EAA 100%)"
                    }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{user?.full_name}</p>
                    <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                  </div>
                </div>
                <span
                  className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: roleStyle.bg, color: roleStyle.color }}
                >
                  {isSuperAdmin && <Shield className="h-3 w-3" />}
                  {isSuperAdmin ? "Super Admin" : user?.can_approve_timesheets ? "Approver" : "Employee"}
                </span>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <Link
                  to="/change-password"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-light-bg hover:text-text-primary transition-colors"
                >
                  <Key className="h-4 w-4" />
                  Change Password
                </Link>
                {isSuperAdmin && (
                  <Link
                    to="/audit-logs"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-light-bg hover:text-text-primary transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Audit Logs
                  </Link>
                )}
                <div className="mx-3 my-1 h-px bg-border-color" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
