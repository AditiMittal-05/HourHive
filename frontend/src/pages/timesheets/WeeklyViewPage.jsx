import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, addDays, subWeeks, addWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { timesheetsService } from "@/services/timesheets.service";
import { PageLoader } from "@/components/shared/PageLoader";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyViewPage() {
  const [weekDate, setWeekDate] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const weekStart = format(weekDate, "yyyy-MM-dd");

  const { data, isLoading } = useQuery({
    queryKey: ["weekly-grid", weekStart],
    queryFn: () => timesheetsService.weeklyGrid(weekStart),
  });

  const weekDates = DAYS.map((_, i) => addDays(weekDate, i));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Weekly Timesheet</h1>
          <p className="text-text-secondary text-sm mt-0.5">Excel-style weekly view</p>
        </div>
        <div className="flex items-center gap-2">
          {data?.status && <StatusBadge status={data.status} />}
        </div>
      </div>

      {/* Week navigator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => setWeekDate(subWeeks(weekDate, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="font-semibold text-text-primary">
                {format(weekDate, "MMM d")} – {format(addDays(weekDate, 6), "MMM d, yyyy")}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">Week {format(weekDate, "w")} of {format(weekDate, "yyyy")}</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => setWeekDate(addWeeks(weekDate, 1))} disabled={weekDate >= startOfWeek(new Date(), { weekStartsOn: 1 })}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {isLoading ? <PageLoader /> : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-primary/5 border-b border-border-color">
                  <th className="text-left text-xs font-semibold text-text-secondary px-4 py-3 w-48">Project / Activity</th>
                  {DAYS.map((day, i) => (
                    <th key={day} className="text-center text-xs font-semibold px-3 py-3 w-20">
                      <div className={`${format(weekDates[i], "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? "text-primary font-bold" : "text-text-secondary"}`}>
                        {DAY_LABELS[i]}
                      </div>
                      <div className={`text-[10px] font-normal mt-0.5 ${format(weekDates[i], "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? "text-primary" : "text-text-secondary/60"}`}>
                        {format(weekDates[i], "d MMM")}
                      </div>
                    </th>
                  ))}
                  <th className="text-center text-xs font-semibold text-text-secondary px-3 py-3 w-20">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {(!data?.entries || data.entries.length === 0) ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-text-secondary font-medium">No entries for this week</p>
                      <p className="text-text-secondary text-sm mt-1">Go to "Log Time" to add entries</p>
                    </td>
                  </tr>
                ) : (
                  data.entries.map((row, idx) => (
                    <tr key={idx} className="hover:bg-light-bg transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-text-primary truncate">{row.project_name}</p>
                        <p className="text-xs text-text-secondary truncate">{row.activity_name}</p>
                      </td>
                      {DAYS.map((day) => (
                        <td key={day} className="px-3 py-3 text-center">
                          {row[day] ? (
                            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold rounded-md px-2 py-1 tabular-nums">
                              {Number(row[day]).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-text-secondary/30 text-xs">—</span>
                          )}
                        </td>
                      ))}
                      <td className="px-3 py-3 text-center">
                        <span className="text-sm font-bold text-text-primary tabular-nums">{Number(row.row_total).toFixed(2)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {/* Day totals footer */}
              {data && data.entries.length > 0 && (
                <tfoot>
                  <tr className="bg-primary/5 border-t-2 border-primary/20 font-semibold">
                    <td className="px-4 py-3 text-sm font-bold text-text-primary">Daily Total</td>
                    {DAYS.map((day) => (
                      <td key={day} className="px-3 py-3 text-center">
                        <span className={`text-sm font-bold tabular-nums ${data.day_totals[day] > 0 ? "text-primary" : "text-text-secondary/30"}`}>
                          {data.day_totals[day] > 0 ? data.day_totals[day].toFixed(2) : "—"}
                        </span>
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center">
                      <span className="text-base font-bold text-primary tabular-nums">{Number(data.grand_total).toFixed(2)}</span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border-color bg-white p-4 text-center">
            <p className="text-2xl font-bold text-primary tabular-nums">{Number(data.grand_total).toFixed(1)}h</p>
            <p className="text-xs text-text-secondary mt-1">Total Hours</p>
          </div>
          <div className="rounded-xl border border-border-color bg-white p-4 text-center">
            <p className="text-2xl font-bold text-text-primary tabular-nums">{data.entries.length}</p>
            <p className="text-xs text-text-secondary mt-1">Activity Rows</p>
          </div>
          <div className="rounded-xl border border-border-color bg-white p-4 text-center">
            <p className="text-2xl font-bold text-secondary tabular-nums">
              {Object.values(data.day_totals).filter(v => v > 0).length}
            </p>
            <p className="text-xs text-text-secondary mt-1">Days Worked</p>
          </div>
          <div className="rounded-xl border border-border-color bg-white p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">
              {data.status ? <span className={`capitalize text-sm ${data.status === "approved" ? "text-success" : data.status === "rejected" ? "text-danger" : "text-warning"}`}>{data.status}</span> : "—"}
            </p>
            <p className="text-xs text-text-secondary mt-1">Status</p>
          </div>
        </div>
      )}
    </div>
  );
}
