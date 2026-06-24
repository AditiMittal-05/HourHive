import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Calendar } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth } from "date-fns";
import { cn } from "@/utils/cn";
import { isWeekend } from "@/utils/holidays";
import { useHolidays } from "@/hooks/useHolidays";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildCalendarDays(viewMonth) {
  const start = startOfWeek(startOfMonth(viewMonth));
  const end = endOfWeek(endOfMonth(viewMonth));
  const days = [];
  let cur = start;
  while (cur <= end) {
    days.push(new Date(cur));
    cur = addDays(cur, 1);
  }
  return days;
}

export function FloatingCalendar() {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const ref = useRef(null);
  const { getHolidayInfo } = useHolidays();

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const today = new Date();
  const calDays = buildCalendarDays(viewMonth);

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

      {/* Calendar panel */}
      {open && (
        <div
          className="w-80 rounded-2xl border border-border-color bg-white shadow-2xl overflow-hidden animate-scale-in"
          style={{ boxShadow: "0 20px 60px -8px rgba(11,46,89,0.22), 0 8px 24px -4px rgba(11,46,89,0.12)" }}
        >
          {/* Time header */}
          <div className="px-4 pt-4 pb-3 border-b border-border-color"
            style={{ background: "linear-gradient(135deg, #0B2E59 0%, #123D72 100%)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white tabular-nums leading-none">
                  {format(now, "HH:mm")}
                  <span className="text-lg text-white/60 ml-1">{format(now, "ss")}s</span>
                </p>
                <p className="text-sm text-white/70 mt-1 font-medium">
                  {format(now, "EEEE, MMMM d, yyyy")}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="p-1.5 rounded-lg hover:bg-light-bg transition-colors text-text-secondary hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-bold text-text-primary">
              {format(viewMonth, "MMMM yyyy")}
            </p>
            <button
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="p-1.5 rounded-lg hover:bg-light-bg transition-colors text-text-secondary hover:text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-3 pb-1">
            {DAY_HEADERS.map((d) => (
              <div key={d} className={cn(
                "text-center text-[10px] font-bold uppercase tracking-wide py-1",
                d === "Sun" || d === "Sat" ? "text-danger/70" : "text-text-secondary"
              )}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5 px-3 pb-3">
            {calDays.map((day, i) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const isToday = isSameDay(day, today);
              const isCurrentMonth = isSameMonth(day, viewMonth);
              const weekend = isWeekend(dateStr);
              const { isHoliday, name: holidayName } = getHolidayInfo(dateStr);

              return (
                <DayCell
                  key={i}
                  day={day}
                  isToday={isToday}
                  isCurrentMonth={isCurrentMonth}
                  isWeekend={weekend}
                  isHoliday={isHoliday}
                  holidayName={holidayName}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 py-3 border-t border-border-color bg-light-bg">
            {[
              { color: "bg-primary", label: "Today" },
              { color: "bg-danger/20 border border-danger/30", label: "Holiday" },
              { color: "bg-slate-100", label: "Weekend" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-sm flex-shrink-0", color)} />
                <span className="text-[10px] text-text-secondary font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* Today shortcut */}
          <div className="px-4 pb-3">
            <button
              onClick={() => setViewMonth(new Date())}
              className="w-full text-xs text-primary font-semibold py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Jump to today
            </button>
          </div>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((p) => !p)}
        title="Calendar & Holidays"
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex flex-col items-center justify-center transition-all duration-200 select-none",
          "hover:scale-110 active:scale-95",
          open
            ? "text-white"
            : "text-white"
        )}
        style={{
          background: open
            ? "linear-gradient(135deg, #A7CE39 0%, #8FB52E 100%)"
            : "linear-gradient(135deg, #0B2E59 0%, #1a4a8a 100%)",
          boxShadow: open
            ? "0 8px 24px rgba(167,206,57,0.5)"
            : "0 8px 24px rgba(11,46,89,0.4)",
        }}
      >
        <span className="text-lg font-black leading-none">{format(now, "d")}</span>
        <span className="text-[9px] font-bold uppercase tracking-wider leading-none mt-0.5 opacity-80">
          {format(now, "MMM")}
        </span>
      </button>
    </div>
  );
}

function DayTooltip({ day, isHoliday, holidayName }) {
  let label;
  if (isHoliday) {
    label = holidayName;
  } else {
    const dayOfWeek = new Date(format(day, "yyyy-MM-dd") + "T00:00:00").getDay();
    label = dayOfWeek === 0 ? "Sunday" : "Saturday";
  }
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap bg-text-primary text-white text-[10px] font-medium px-2 py-1 rounded-md shadow-lg pointer-events-none">
      {label}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-text-primary" />
    </div>
  );
}

function DayCell({ day, isToday, isCurrentMonth, isWeekend, isHoliday, holidayName }) {
  const [showTip, setShowTip] = useState(false);
  const isNonWorking = isWeekend || isHoliday;

  return (
    <div className="relative flex items-center justify-center">
      <button
        onMouseEnter={() => isNonWorking && setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        className={cn(
          "w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-100 relative flex items-center justify-center",
          !isCurrentMonth && "opacity-25 pointer-events-none",
          isToday && "text-white font-bold ring-2 ring-primary ring-offset-1",
          isHoliday && !isToday && "bg-red-50 text-danger border border-danger/20",
          isWeekend && !isHoliday && !isToday && "bg-slate-50 text-slate-400",
          !isNonWorking && !isToday && "text-text-primary hover:bg-primary-50 hover:text-primary",
        )}
        style={isToday ? { background: "linear-gradient(135deg, #0B2E59, #123D72)" } : undefined}
      >
        {format(day, "d")}
        {isHoliday && (
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-danger" />
        )}
      </button>

      {/* Tooltip */}
      {showTip && (
        <DayTooltip day={day} isHoliday={isHoliday} holidayName={holidayName} />
      )}
    </div>
  );
}
