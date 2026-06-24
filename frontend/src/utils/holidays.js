// Indian national + public holidays
// Format: "MM-DD" for recurring every year, "YYYY-MM-DD" for specific year
const ANNUAL_HOLIDAYS = [
  { md: "01-01", name: "New Year Day" },
  { md: "01-26", name: "Republic Day" },
  { md: "08-15", name: "Independence Day" },
  { md: "10-02", name: "Gandhi Jayanti" },
  { md: "12-25", name: "Christmas Day" },
];

// Year-specific holidays (add future years as needed)
const SPECIFIC_HOLIDAYS = [
  // 2025
  { date: "2025-02-26", name: "Maha Shivratri" },
  { date: "2025-03-14", name: "Holi" },
  { date: "2025-04-18", name: "Good Friday" },
  { date: "2025-08-16", name: "Raksha Bandhan" },
  { date: "2025-08-27", name: "Janmashtami" },
  { date: "2025-10-02", name: "Dussehra" },
  { date: "2025-10-20", name: "Diwali" },
  { date: "2025-10-21", name: "Govardhan Puja" },
  { date: "2025-11-05", name: "Guru Nanak Jayanti" },
  // 2026 — matches official company holiday list
  { date: "2026-02-15", name: "Maha Shivratri" },
  { date: "2026-03-04", name: "Holi" },
  { date: "2026-08-28", name: "Raksha Bandhan" },
  { date: "2026-10-20", name: "Dussehra" },
  { date: "2026-11-08", name: "Diwali" },
  { date: "2026-11-09", name: "Govardhan Puja" },
  { date: "2026-11-10", name: "Govardhan Puja" },
  { date: "2026-11-11", name: "Bhai Dooj" },
];

/** Returns { isHoliday: bool, name: string | null } for a "YYYY-MM-DD" date string. */
export function getHolidayInfo(dateStr) {
  const specific = SPECIFIC_HOLIDAYS.find((h) => h.date === dateStr);
  if (specific) return { isHoliday: true, name: specific.name };

  const md = dateStr.slice(5); // "MM-DD"
  const annual = ANNUAL_HOLIDAYS.find((h) => h.md === md);
  if (annual) return { isHoliday: true, name: annual.name };

  return { isHoliday: false, name: null };
}

/** Returns true if the date is Saturday (6) or Sunday (0). */
export function isWeekend(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  return day === 0 || day === 6;
}

/** Returns true if timesheet entry is NOT allowed on this date. */
export function isNonWorkingDay(dateStr) {
  return isWeekend(dateStr) || getHolidayInfo(dateStr).isHoliday;
}

/** Human-readable reason why entry is blocked, or null if allowed. */
export function getNonWorkingReason(dateStr) {
  if (isWeekend(dateStr)) {
    const d = new Date(dateStr + "T00:00:00");
    return d.getDay() === 0 ? "Sunday — weekend" : "Saturday — weekend";
  }
  const { isHoliday, name } = getHolidayInfo(dateStr);
  if (isHoliday) return `Public holiday — ${name}`;
  return null;
}
