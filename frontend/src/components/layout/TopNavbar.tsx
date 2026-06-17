import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Menu, Bell, Search, LogOut, Key, ChevronDown, User } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/utils/cn";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/timesheets": "My Timesheets",
  "/timesheets/entry": "Log Time",
  "/timesheets/weekly": "Weekly View",
  "/users": "User Management",
  "/projects": "Project Management",
  "/activities": "Activity Management",
  "/approvals": "Approvals",
  "/reports": "Reports",
  "/analytics": "Analytics",
  "/change-password": "Change Password",
};

interface TopNavbarProps {
  onMenuToggle: () => void;
}

export function TopNavbar({ onMenuToggle }: TopNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { user, logout } = useAuthStore();

  const pageTitle = breadcrumbMap[location.pathname] || "HourHive";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-border-color flex items-center px-6 gap-4 sticky top-0 z-30 shadow-sm">
      {/* Menu toggle */}
      <button onClick={onMenuToggle} className="text-text-secondary hover:text-primary transition-colors p-1 rounded-lg hover:bg-light-bg">
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb / Page title */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-text-secondary">HourHive</span>
        <ChevronDown className="h-3 w-3 text-text-secondary rotate-[-90deg]" />
        <span className="font-semibold text-text-primary">{pageTitle}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="pl-9 pr-4 h-9 w-56 rounded-lg border border-border-color bg-light-bg text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all focus:w-72"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 text-text-secondary hover:text-primary rounded-lg hover:bg-light-bg transition-colors">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
      </button>

      {/* User dropdown */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen((p) => !p)}
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-light-bg transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{user?.full_name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-text-primary leading-none">{user?.full_name}</p>
            <p className="text-xs text-text-secondary capitalize mt-0.5">{user?.role}</p>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-text-secondary transition-transform", menuOpen && "rotate-180")} />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-12 w-56 bg-white rounded-xl border border-border-color shadow-card-hover z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-border-color">
                <p className="text-sm font-semibold text-text-primary">{user?.full_name}</p>
                <p className="text-xs text-text-secondary mt-0.5">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                  {user?.role}
                </span>
              </div>
              <div className="py-1">
                <Link
                  to="/change-password"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:bg-light-bg hover:text-text-primary transition-colors"
                >
                  <Key className="h-4 w-4" /> Change Password
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
