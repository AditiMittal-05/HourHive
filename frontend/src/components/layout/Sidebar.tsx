import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, FolderKanban, Activity, Clock, CheckSquare,
  BarChart3, TrendingUp, Settings, ChevronLeft, ChevronRight, ClipboardList,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/store/auth.store";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "My Timesheets", path: "/timesheets", icon: ClipboardList },
  { label: "Log Time", path: "/timesheets/entry", icon: Clock },
  { label: "Weekly View", path: "/timesheets/weekly", icon: FolderKanban },
  { label: "Approvals", path: "/approvals", icon: CheckSquare, adminOnly: true },
  { label: "Users", path: "/users", icon: Users, adminOnly: true },
  { label: "Projects", path: "/projects", icon: FolderKanban },
  { label: "Activities", path: "/activities", icon: Activity, adminOnly: true },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Analytics", path: "/analytics", icon: TrendingUp },
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full sidebar-gradient text-white z-40 flex flex-col transition-all duration-300 shadow-sidebar",
        open ? "w-64" : "w-16"
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center h-16 px-4 border-b border-white/10", open ? "gap-3" : "justify-center")}>
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/20">
          <span className="text-base">🐝</span>
        </div>
        {open && (
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold tracking-tight">HourHive</h1>
            <p className="text-[10px] text-white/50 truncate">gNxt Systems</p>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary border-2 border-white shadow-md flex items-center justify-center hover:bg-primary-600 transition-colors z-50"
      >
        {open ? <ChevronLeft className="h-3 w-3 text-white" /> : <ChevronRight className="h-3 w-3 text-white" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2">
        {/* Timesheet section */}
        {open && <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest px-2 mb-2">Timesheets</p>}
        {visibleItems.slice(0, 4).map((item) => (
          <NavLink key={item.path} item={item} open={open} active={location.pathname === item.path} />
        ))}

        {isAdmin && (
          <>
            {open && <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest px-2 mb-2 mt-4">Management</p>}
            {visibleItems.slice(4, 8).map((item) => (
              <NavLink key={item.path} item={item} open={open} active={location.pathname === item.path} />
            ))}
          </>
        )}

        {open && <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest px-2 mb-2 mt-4">Insights</p>}
        {visibleItems.slice(-2).map((item) => (
          <NavLink key={item.path} item={item} open={open} active={location.pathname === item.path} />
        ))}
      </nav>

      {/* User info at bottom */}
      {open && (
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-secondary">
                {user?.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-white/50 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function NavLink({ item, open, active }: { item: NavItem; open: boolean; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      title={!open ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 px-2 py-2.5 rounded-lg mb-0.5 transition-all duration-150 group",
        active
          ? "bg-white/15 text-white shadow-sm"
          : "text-white/60 hover:bg-white/8 hover:text-white"
      )}
    >
      <Icon className={cn("h-4 w-4 flex-shrink-0", active && "text-secondary")} />
      {open && <span className="text-sm font-medium truncate">{item.label}</span>}
      {active && open && <div className="ml-auto w-1 h-4 rounded-full bg-secondary" />}
    </Link>
  );
}
