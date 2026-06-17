import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, FolderKanban, Activity, CheckSquare,
  BarChart3, TrendingUp, ChevronLeft, ChevronRight, ClipboardList, Timer,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/store/auth.store";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navSections = [
  {
    label: "Timesheets",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "My Timesheets", path: "/timesheets", icon: ClipboardList },
      { label: "Log Time", path: "/timesheets/entry", icon: Timer },
      { label: "Weekly View", path: "/timesheets/weekly", icon: FolderKanban },
    ],
  },
  {
    label: "Management",
    adminOnly: true,
    items: [
      { label: "Approvals", path: "/approvals", icon: CheckSquare, adminOnly: true },
      { label: "Users", path: "/users", icon: Users, adminOnly: true },
      { label: "Projects", path: "/projects", icon: FolderKanban },
      { label: "Activities", path: "/activities", icon: Activity, adminOnly: true },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Reports", path: "/reports", icon: BarChart3 },
      { label: "Analytics", path: "/analytics", icon: TrendingUp },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full sidebar-gradient text-white z-40 flex flex-col transition-all duration-300 ease-in-out shadow-sidebar",
        open ? "w-64" : "w-16"
      )}
    >
      {/* Header / Logo */}
      <div className={cn(
        "flex items-center h-16 border-b border-white/8 flex-shrink-0",
        open ? "px-5 gap-3" : "justify-center px-0"
      )}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #A7CE39 0%, #8FB52E 100%)" }}>
          <span className="text-sm font-black text-white">g</span>
        </div>
        {open && (
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-white">HourHive</h1>
            <p className="text-[10px] text-white/45 tracking-wide font-medium">gNxt Systems</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-secondary border-2 border-white/20 shadow-md flex items-center justify-center hover:bg-secondary-500 transition-all duration-200 z-50"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
      >
        {open ? (
          <ChevronLeft className="h-3 w-3 text-white" />
        ) : (
          <ChevronRight className="h-3 w-3 text-white" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-sidebar py-3 px-2">
        {navSections.map((section) => {
          if (section.adminOnly && !isAdmin) return null;
          const visibleItems = section.items.filter((item) => !("adminOnly" in item) || !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label} className="mb-1">
              {open && (
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-1.5 mt-3 first:mt-0">
                  {section.label}
                </p>
              )}
              {!open && section.label !== "Timesheets" && (
                <div className="mx-3 my-2 h-px bg-white/10" />
              )}
              {visibleItems.map((item) => (
                <NavLink
                  key={item.path}
                  item={item}
                  open={open}
                  active={location.pathname === item.path}
                />
              ))}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className={cn(
        "border-t border-white/8 flex-shrink-0",
        open ? "p-4" : "p-2 flex justify-center"
      )}>
        {open ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #A7CE39 0%, #8FB52E 100%)" }}>
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/90 truncate">{user?.full_name}</p>
              <p className="text-[10px] text-white/45 capitalize font-medium">{user?.role}</p>
            </div>
          </div>
        ) : (
          <div
            title={user?.full_name}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #A7CE39 0%, #8FB52E 100%)" }}
          >
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
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
        "relative flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-150 group overflow-hidden",
        active
          ? "bg-white/12 text-white"
          : "text-white/55 hover:bg-white/7 hover:text-white/90"
      )}
    >
      {/* Active left border indicator */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-secondary" />
      )}
      <Icon className={cn(
        "h-4 w-4 flex-shrink-0 transition-colors",
        active ? "text-secondary" : "text-current"
      )} />
      {open && (
        <span className={cn(
          "text-sm font-medium truncate transition-colors",
          active ? "text-white font-semibold" : ""
        )}>
          {item.label}
        </span>
      )}
      {active && open && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
      )}
    </Link>
  );
}
