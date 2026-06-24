import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { holidayService } from "@/services/holiday.service";
import { getHolidayInfo, isWeekend } from "@/utils/holidays";

/**
 * Returns holiday lookup functions that merge API holidays (DB-managed)
 * with the static built-in list.
 * Queries are disabled when the user is not authenticated — prevents 401
 * redirect loops on the login page.
 */
export function useHolidays() {
  const currentYear = new Date().getFullYear();
  const isAuthenticated = !!localStorage.getItem("access_token");

  const { data: currentYearData } = useQuery({
    queryKey: ["holidays", currentYear],
    queryFn: () => holidayService.list(currentYear),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 60,
    retry: false,
  });

  const { data: nextYearData } = useQuery({
    queryKey: ["holidays", currentYear + 1],
    queryFn: () => holidayService.list(currentYear + 1),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 60,
    retry: false,
  });

  const apiMap = useMemo(() => {
    const map = new Map();
    const items = [
      ...(currentYearData?.items || []),
      ...(nextYearData?.items || []),
    ];
    items.forEach((h) => {
      const dateStr = typeof h.date === "string" ? h.date : h.date.toISOString().slice(0, 10);
      map.set(dateStr, h.name);
    });
    return map;
  }, [currentYearData, nextYearData]);

  const getHolidayInfoDynamic = useCallback(
    (dateStr) => {
      if (apiMap.has(dateStr)) return { isHoliday: true, name: apiMap.get(dateStr) };
      return getHolidayInfo(dateStr);
    },
    [apiMap]
  );

  const isNonWorkingDayDynamic = useCallback(
    (dateStr) => isWeekend(dateStr) || getHolidayInfoDynamic(dateStr).isHoliday,
    [getHolidayInfoDynamic]
  );

  const getNonWorkingReasonDynamic = useCallback(
    (dateStr) => {
      if (isWeekend(dateStr)) {
        const day = new Date(dateStr + "T00:00:00").getDay();
        return day === 0 ? "Sunday — weekend" : "Saturday — weekend";
      }
      const { isHoliday, name } = getHolidayInfoDynamic(dateStr);
      if (isHoliday) return `Public holiday — ${name}`;
      return null;
    },
    [getHolidayInfoDynamic]
  );

  return {
    getHolidayInfo: getHolidayInfoDynamic,
    isNonWorkingDay: isNonWorkingDayDynamic,
    getNonWorkingReason: getNonWorkingReasonDynamic,
  };
}
