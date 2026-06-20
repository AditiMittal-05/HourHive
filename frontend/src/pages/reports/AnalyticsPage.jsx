import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, BarChart3, Users } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { format, startOfMonth, endOfMonth } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { reportsService } from "@/services/reports.service";
import { SkeletonCard } from "@/components/shared/PageLoader";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const BRAND_COLORS = ["#0B2E59","#A7CE39","#F59E0B","#EF4444","#8B5CF6","#06B6D4"];

function monthDateRange(month, year) {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  return { start_date: format(start, "yyyy-MM-dd"), end_date: format(end, "yyyy-MM-dd") };
}

function pctChange(a, b) {
  if (a === 0) return b > 0 ? 100 : 0;
  return ((b - a) / a) * 100;
}

function TrendBadge({ pct }) {
  if (pct > 2) return (
    <div className="flex items-center gap-1 text-emerald-600">
      <TrendingUp className="h-3.5 w-3.5" />
      <span className="text-sm font-semibold tabular-nums">+{pct.toFixed(1)}%</span>
    </div>
  );
  if (pct < -2) return (
    <div className="flex items-center gap-1 text-danger">
      <TrendingDown className="h-3.5 w-3.5" />
      <span className="text-sm font-semibold tabular-nums">{pct.toFixed(1)}%</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1 text-text-secondary">
      <Minus className="h-3.5 w-3.5" />
      <span className="text-sm font-semibold tabular-nums">{pct.toFixed(1)}%</span>
    </div>
  );
}

export function AnalyticsPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const prevMonth = currentMonth > 1 ? currentMonth - 1 : 12;
  const prevYear = currentMonth > 1 ? currentYear : currentYear - 1;

  const [empMonth1, setEmpMonth1] = useState(prevMonth);
  const [empYear1, setEmpYear1] = useState(prevYear);
  const [empMonth2, setEmpMonth2] = useState(currentMonth);
  const [empYear2, setEmpYear2] = useState(currentYear);

  const [projMonth1, setProjMonth1] = useState(prevMonth);
  const [projYear1, setProjYear1] = useState(prevYear);
  const [projMonth2, setProjMonth2] = useState(currentMonth);
  const [projYear2, setProjYear2] = useState(currentYear);

  const years = [currentYear, currentYear - 1, currentYear - 2];

  const empQ1 = useQuery({
    queryKey: ["monthly-summary", empMonth1, empYear1],
    queryFn: () => reportsService.monthlySummary({ month: empMonth1, year: empYear1 }),
  });
  const empQ2 = useQuery({
    queryKey: ["monthly-summary", empMonth2, empYear2],
    queryFn: () => reportsService.monthlySummary({ month: empMonth2, year: empYear2 }),
  });

  const projRange1 = monthDateRange(projMonth1, projYear1);
  const projRange2 = monthDateRange(projMonth2, projYear2);
  const projQ1 = useQuery({
    queryKey: ["project-effort", projRange1],
    queryFn: () => reportsService.projectEffort(projRange1),
  });
  const projQ2 = useQuery({
    queryKey: ["project-effort", projRange2],
    queryFn: () => reportsService.projectEffort(projRange2),
  });

  const empMap1 = Object.fromEntries((empQ1.data || []).map((r) => [r.employee_code, r]));
  const empMap2 = Object.fromEntries((empQ2.data || []).map((r) => [r.employee_code, r]));
  const allEmpCodes = Array.from(new Set([...Object.keys(empMap1), ...Object.keys(empMap2)]));
  const empComparison = allEmpCodes.map((code) => {
    const r1 = empMap1[code];
    const r2 = empMap2[code];
    const h1 = Number(r1?.total_hours || 0);
    const h2 = Number(r2?.total_hours || 0);
    return { name: r1?.employee_name || r2?.employee_name || code, code, h1, h2, pct: pctChange(h1, h2) };
  }).sort((a, b) => b.h2 - a.h2);

  const projMap1 = Object.fromEntries((projQ1.data || []).map((r) => [r.project_code, r]));
  const projMap2 = Object.fromEntries((projQ2.data || []).map((r) => [r.project_code, r]));
  const allProjCodes = Array.from(new Set([...Object.keys(projMap1), ...Object.keys(projMap2)]));
  const projComparison = allProjCodes.map((code) => {
    const r1 = projMap1[code];
    const r2 = projMap2[code];
    const h1 = Number(r1?.total_hours || 0);
    const h2 = Number(r2?.total_hours || 0);
    return { name: r1?.project_name || r2?.project_name || code, code, h1, h2, pct: pctChange(h1, h2) };
  }).sort((a, b) => b.h2 - a.h2);

  const MonthYearPicker = ({ label, month, year, onMonth, onYear }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</Label>
      <div className="flex gap-2">
        <Select value={month.toString()} onValueChange={(v) => onMonth(parseInt(v))}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => <SelectItem key={i + 1} value={(i + 1).toString()}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={year.toString()} onValueChange={(v) => onYear(parseInt(v))}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            {years.map((y) => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const tooltipStyle = {
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    fontSize: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Analytics</h1>
        <p className="text-text-secondary text-sm mt-0.5">Month-over-month comparisons and workforce insights</p>
      </div>

      {/* Employee Comparison */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">Employee Hour Comparison</h2>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-6 items-end">
              <MonthYearPicker label="Period 1" month={empMonth1} year={empYear1} onMonth={setEmpMonth1} onYear={setEmpYear1} />
              <div className="flex items-end pb-2 text-text-secondary font-bold text-sm px-1">VS</div>
              <MonthYearPicker label="Period 2" month={empMonth2} year={empYear2} onMonth={setEmpMonth2} onYear={setEmpYear2} />
            </div>
          </CardContent>
        </Card>

        {(empQ1.isLoading || empQ2.isLoading) ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <SkeletonCard /><SkeletonCard />
          </div>
        ) : empComparison.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-text-secondary text-sm">
              No employee data for selected periods
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                  Hours by Employee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={empComparison.slice(0, 10)} margin={{ top: 5, right: 10, bottom: 30, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} angle={-25} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`${v.toFixed(1)}h`]} contentStyle={tooltipStyle} />
                    <Legend iconType="circle" iconSize={8} />
                    <Bar name={`${MONTHS[empMonth1 - 1]} ${empYear1}`} dataKey="h1" fill="#0B2E59" radius={[4, 4, 0, 0]} />
                    <Bar name={`${MONTHS[empMonth2 - 1]} ${empYear2}`} dataKey="h2" fill="#A7CE39" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                  Comparison Table
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-y-auto max-h-80">
                  <table className="enterprise-table w-full">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th className="text-right">{MONTHS[empMonth1 - 1].slice(0, 3)} {empYear1}</th>
                        <th className="text-right">{MONTHS[empMonth2 - 1].slice(0, 3)} {empYear2}</th>
                        <th className="text-right">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empComparison.map((row, i) => (
                        <tr key={i}>
                          <td className="text-sm font-medium text-text-primary">{row.name}</td>
                          <td className="text-sm text-right tabular-nums text-text-secondary">{row.h1.toFixed(1)}h</td>
                          <td className="text-sm text-right tabular-nums font-semibold text-text-primary">{row.h2.toFixed(1)}h</td>
                          <td className="text-right"><TrendBadge pct={row.pct} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Project Comparison */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-secondary-50 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-secondary-600" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">Project Effort Comparison</h2>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-6 items-end">
              <MonthYearPicker label="Period 1" month={projMonth1} year={projYear1} onMonth={setProjMonth1} onYear={setProjYear1} />
              <div className="flex items-end pb-2 text-text-secondary font-bold text-sm px-1">VS</div>
              <MonthYearPicker label="Period 2" month={projMonth2} year={projYear2} onMonth={setProjMonth2} onYear={setProjYear2} />
            </div>
          </CardContent>
        </Card>

        {(projQ1.isLoading || projQ2.isLoading) ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <SkeletonCard /><SkeletonCard />
          </div>
        ) : projComparison.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-text-secondary text-sm">
              No project data for selected periods
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                  Hours by Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={projComparison.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} width={80} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`${v.toFixed(1)}h`]} contentStyle={tooltipStyle} />
                    <Legend iconType="circle" iconSize={8} />
                    <Bar name={`${MONTHS[projMonth1 - 1]} ${projYear1}`} dataKey="h1" fill="#0B2E59" radius={[0, 4, 4, 0]} />
                    <Bar name={`${MONTHS[projMonth2 - 1]} ${projYear2}`} dataKey="h2" fill="#A7CE39" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                  Project Comparison Table
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-y-auto max-h-80">
                  <table className="enterprise-table w-full">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th className="text-right">{MONTHS[projMonth1 - 1].slice(0, 3)} {projYear1}</th>
                        <th className="text-right">{MONTHS[projMonth2 - 1].slice(0, 3)} {projYear2}</th>
                        <th className="text-right">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projComparison.map((row, i) => (
                        <tr key={i}>
                          <td>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: BRAND_COLORS[i % BRAND_COLORS.length] }}
                              />
                              <span className="text-sm font-medium text-text-primary truncate max-w-[130px]">{row.name}</span>
                            </div>
                          </td>
                          <td className="text-sm text-right tabular-nums text-text-secondary">{row.h1.toFixed(1)}h</td>
                          <td className="text-sm text-right tabular-nums font-semibold text-text-primary">{row.h2.toFixed(1)}h</td>
                          <td className="text-right"><TrendBadge pct={row.pct} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </div>
  );
}
