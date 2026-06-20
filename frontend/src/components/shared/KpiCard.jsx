import { cn } from "@/utils/cn";

const colorMap = {
  blue: {
    iconBg: "bg-primary-50",
    iconColor: "text-primary",
    accent: "border-l-primary-400",
    trendBg: "bg-primary-50 text-primary",
  },
  green: {
    iconBg: "bg-secondary-50",
    iconColor: "text-secondary-600",
    accent: "border-l-secondary-400",
    trendBg: "bg-secondary-50 text-secondary-600",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    accent: "border-l-amber-400",
    trendBg: "bg-amber-50 text-amber-700",
  },
  red: {
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    accent: "border-l-red-400",
    trendBg: "bg-red-50 text-red-700",
  },
  purple: {
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    accent: "border-l-purple-400",
    trendBg: "bg-purple-50 text-purple-700",
  },
};

export function KpiCard({ title, value, subtitle, icon: Icon, color = "blue", trend }) {
  const c = colorMap[color];
  return (
    <div className={cn(
      "relative bg-white rounded-xl border-l-4 border border-border-color p-5 shadow-kpi",
      "hover:shadow-kpi-hover transition-shadow duration-200 group overflow-hidden",
      c.accent
    )}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "radial-gradient(ellipse at top right, rgba(11,46,89,0.02) 0%, transparent 70%)" }} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-text-primary mt-1.5 tabular-nums tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-1 font-medium">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-semibold",
              c.trendBg
            )}>
              <span>{trend.positive !== false ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
          c.iconBg
        )}>
          <Icon className={cn("h-5 w-5", c.iconColor)} />
        </div>
      </div>
    </div>
  );
}
