import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/utils/cn";

const colorMap = {
  blue: {
    iconBg: "from-primary-50 to-primary-100",
    iconColor: "text-primary",
    accent: "kpi-card-blue",
    trendUp: "bg-primary-50 text-primary",
    trendDown: "bg-red-50 text-danger",
    glow: "rgba(37,99,235,0.10)",
  },
  green: {
    iconBg: "from-secondary-50 to-secondary-100",
    iconColor: "text-secondary-500",
    accent: "kpi-card-green",
    trendUp: "bg-secondary-50 text-secondary-500",
    trendDown: "bg-red-50 text-danger",
    glow: "rgba(16,185,129,0.10)",
  },
  amber: {
    iconBg: "from-amber-50 to-amber-100",
    iconColor: "text-warning",
    accent: "kpi-card-amber",
    trendUp: "bg-amber-50 text-warning",
    trendDown: "bg-red-50 text-danger",
    glow: "rgba(245,158,11,0.10)",
  },
  red: {
    iconBg: "from-red-50 to-red-100",
    iconColor: "text-danger",
    accent: "kpi-card-red",
    trendUp: "bg-red-50 text-danger",
    trendDown: "bg-red-50 text-danger",
    glow: "rgba(239,68,68,0.10)",
  },
  purple: {
    iconBg: "from-purple-50 to-purple-100",
    iconColor: "text-purple-600",
    accent: "kpi-card-purple",
    trendUp: "bg-purple-50 text-purple-600",
    trendDown: "bg-red-50 text-danger",
    glow: "rgba(139,92,246,0.10)",
  },
};

export function KpiCard({ title, value, subtitle, icon: Icon, color = "blue", trend }) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      className={cn("relative bg-white rounded-2xl border-l-4 border border-border-color p-5 overflow-hidden cursor-default", c.accent)}
      whileHover={{
        y: -3,
        boxShadow: `0 12px 28px -6px ${c.glow}, 0 4px 10px -3px rgba(0,0,0,0.06)`,
        borderColor: "rgba(37,99,235,0.2)",
      }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Hover overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top right, ${c.glow} 0%, transparent 70%)` }} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{title}</p>
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl font-bold text-text-primary mt-1.5 tabular-nums tracking-tight"
          >
            {value}
          </motion.p>
          {subtitle && <p className="text-xs text-text-muted mt-1 font-medium">{subtitle}</p>}
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded-full text-xs font-semibold",
              trend.positive !== false ? c.trendUp : c.trendDown
            )}>
              {trend.positive !== false
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.08, rotate: 5 }}
          transition={{ duration: 0.2 }}
          className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br", c.iconBg)}
        >
          <Icon className={cn("h-5 w-5", c.iconColor)} />
        </motion.div>
      </div>
    </motion.div>
  );
}
