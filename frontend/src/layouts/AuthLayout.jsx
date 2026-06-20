import { Outlet } from "react-router-dom";
import { Clock, CheckCircle, BarChart3, Shield } from "lucide-react";

const features = [
  { icon: Clock, text: "Real-time time tracking" },
  { icon: CheckCircle, text: "Streamlined approvals" },
  { icon: BarChart3, text: "Executive-grade reports" },
  { icon: Shield, text: "Enterprise-grade security" },
];

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #071A2F 0%, #0B2E59 55%, #123D72 100%)" }}
      >
        {/* Background decoration circles */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full"
          style={{ background: "rgba(167,206,57,0.06)" }} />
        <div className="absolute -bottom-40 -right-20 w-96 h-96 rounded-full"
          style={{ background: "rgba(167,206,57,0.04)" }} />
        <div className="absolute top-1/2 -translate-y-1/2 -right-16 w-64 h-64 rounded-full"
          style={{ background: "rgba(255,255,255,0.02)" }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white"
              style={{ background: "linear-gradient(135deg, #A7CE39 0%, #8FB52E 100%)" }}
            >
              g
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">HourHive</h1>
              <p className="text-xs text-white/45 font-medium tracking-wide">by gNxt Systems</p>
            </div>
          </div>
        </div>

        {/* Middle content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Smart Time Tracking<br />
              <span style={{ color: "#A7CE39" }}>Built for Enterprise</span>
            </h2>
            <p className="text-white/55 text-sm mt-4 leading-relaxed max-w-sm">
              Streamline workforce productivity with real-time time tracking, automated approvals,
              and executive-grade reporting — all in one platform.
            </p>
          </div>

          <div className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(167,206,57,0.15)" }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: "#A7CE39" }} />
                </div>
                <span className="text-sm text-white/70 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} gNxt Systems. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 bg-light-bg">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base text-white"
            style={{ background: "linear-gradient(135deg, #A7CE39 0%, #8FB52E 100%)" }}
          >
            g
          </div>
          <div>
            <h1 className="text-base font-bold text-text-primary">HourHive</h1>
            <p className="text-[10px] text-text-secondary">by gNxt Systems</p>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-border-color shadow-card-hover overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
