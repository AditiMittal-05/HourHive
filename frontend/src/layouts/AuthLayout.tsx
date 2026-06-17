import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-navy via-primary to-[#00A86B]/40 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-white/3 blur-2xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <span className="text-2xl">🐝</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white tracking-tight">HourHive</h1>
              <p className="text-xs text-white/60 font-medium">by gNxt Systems</p>
            </div>
          </div>
          <p className="text-white/50 text-sm">Smart Time Tracking & Workforce Productivity</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <Outlet />
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © 2024 gNxt Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
}
