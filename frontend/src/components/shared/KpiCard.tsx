import { cn } from "@/utils/cn";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "blue" | "green" | "amber" | "red" | "purple";
  trend?: { value: number; positive?: boolean };
}

const colorMap = {
  blue: { bg: "bg-blue-50", icon: "text-primary", border: "border-blue-100", badge: "bg-primary/10 text-primary" },
  green: { bg: "bg-green-50", icon: "text-secondary", border: "border-green-100", badge: "bg-secondary/10 text-secondary" },
  amber: { bg: "bg-amber-50", icon: "text-warning", border: "border-amber-100", badge: "bg-amber-100 text-amber-700" },
  red: { bg: "bg-red-50", icon: "text-danger", border: "border-red-100", badge: "bg-red-100 text-red-700" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100", badge: "bg-purple-100 text-purple-700" },
};

export function KpiCard({ title, value, subtitle, icon: Icon, color = "blue", trend }: KpiCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn("rounded-xl border p-5 bg-white shadow-card hover:shadow-card-hover transition-shadow", c.border)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-3xl font-bold text-text-primary mt-1.5 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
          {trend && (
            <div className={cn("inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-semibold", c.badge)}>
              <span>{trend.positive !== false ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", c.bg)}>
          <Icon className={cn("h-6 w-6", c.icon)} />
        </div>
      </div>
    </div>
  );
}
