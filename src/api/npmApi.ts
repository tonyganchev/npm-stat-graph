/// <reference types="vite/client" />
import { format, subMonths, startOfDay, addDays, startOfYear, startOfMonth, startOfWeek } from 'date-fns';

export interface DownloadStat {
  downloads: number;
  day: string;
}

export interface NpmStatsResponse {
  start: string;
  end: string;
  package: string;
  downloads: DownloadStat[];
  error?: string;
}

export type DateRangeType = "last-7-days" | "last-30-days" | "last-quarter" | "last-6-months" | "last-year" | "last-2-years" | "last-5-years" | "last-10-years" | "ytd" | "mtd" | "wtd" | "custom";

export function calculateDateRange(rangeType: DateRangeType): { start: string, end: string } {
  const today = startOfDay(new Date());
  let start = "";
  let end = format(today, 'yyyy-MM-dd');

  if (rangeType === "last-7-days") {
    start = format(addDays(today, -7), 'yyyy-MM-dd');
  } else if (rangeType === "last-30-days") {
    start = format(addDays(today, -30), 'yyyy-MM-dd');
  } else if (rangeType === "last-year") {
    start = format(subMonths(today, 12), 'yyyy-MM-dd');
  } else if (rangeType === "last-quarter") {
    start = format(subMonths(today, 3), 'yyyy-MM-dd');
  } else if (rangeType === "last-6-months") {
    start = format(subMonths(today, 6), 'yyyy-MM-dd');
  } else if (rangeType === "last-2-years") {
    start = format(subMonths(today, 24), 'yyyy-MM-dd');
  } else if (rangeType === "last-5-years") {
    start = format(subMonths(today, 60), 'yyyy-MM-dd');
  } else if (rangeType === "last-10-years") {
    start = format(subMonths(today, 120), 'yyyy-MM-dd');
  } else if (rangeType === "ytd") {
    start = format(startOfYear(today), 'yyyy-MM-dd');
  } else if (rangeType === "mtd") {
    start = format(startOfMonth(today), 'yyyy-MM-dd');
  } else if (rangeType === "wtd") {
    // start of week, assuming Monday is the first day of the week
    start = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  }

  return { start, end };
}

export async function fetchPackageStats(
  packageName: string,
  rangeType: DateRangeType,
  customStart?: string,
  customEnd?: string
): Promise<NpmStatsResponse> {
  // Always prioritize passed dates if provided, or use rangeType to calculate them.
  // The user wants the logic to be centered around the from-to dates.
  let exactStart = customStart || "";
  let exactEnd = customEnd || "";

  if (!exactStart || !exactEnd) {
    const { start, end } = calculateDateRange(rangeType);
    exactStart = start;
    exactEnd = end;
  }

  const encodedPackageName = encodeURIComponent(packageName);
  const baseUrl = import.meta.env?.DEV ? '/api/npm' : 'https://api.npmjs.org';

  // Splitting by calendar year instead of arbitrary 540-day chunks maximizes cache hits,
  // since past full years (Jan 1 to Dec 31) are permanently cacheable.
  const startYear = parseInt(exactStart.substring(0, 4), 10);
  const endYear = parseInt(exactEnd.substring(0, 4), 10);
  const intervals: { start: string, end: string }[] = [];

  for (let y = startYear; y <= endYear; y++) {
    const isFirstYear = y === startYear;
    const isLastYear = y === endYear;

    const start = isFirstYear ? exactStart : `${y}-01-01`;
    const end = isLastYear ? exactEnd : `${y}-12-31`;

    intervals.push({ start, end });
  }

  const allDownloads: DownloadStat[] = [];
  let fetchError: string | undefined = undefined;

  for (const interval of intervals) {
    const url = `${baseUrl}/downloads/range/${interval.start}:${interval.end}/${encodedPackageName}`;
    try {
      const response = await fetch(url);

      if (response.ok) {
        const data: NpmStatsResponse = await response.json();
        if (data && data.downloads) {
          allDownloads.push(...data.downloads);
        }
      } else if (response.status === 404) {
        // If historical chunk 404s, it might mean the package didn't exist yet, we just gracefully continue.
      } else {
        fetchError = `Failed to fetch interval ${interval.start} to ${interval.end}: HTTP ${response.status}`;
      }
    } catch (err: any) {
      fetchError = `Failed to fetch interval ${interval.start} to ${interval.end}: ${err.message || String(err)}`;
    }
  }

  return {
    start: exactStart,
    end: exactEnd,
    package: packageName,
    downloads: allDownloads,
    error: fetchError
  };
}
