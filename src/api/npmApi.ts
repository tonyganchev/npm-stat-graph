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
  let exactStart = "";
  let exactEnd = "";

  if (rangeType === "custom" && customStart && customEnd) {
    exactStart = customStart;
    exactEnd = customEnd;
  } else {
    const { start, end } = calculateDateRange(rangeType);
    exactStart = start;
    exactEnd = end;
  }

  const encodedPackageName = encodeURIComponent(packageName);
  const baseUrl = import.meta.env?.DEV ? '/api/npm' : 'https://api.npmjs.org';

  // Npm API strictly limits ranges to 18-months jumps.
  const MAX_DAYS = 540;
  let dStart = new Date(exactStart);
  const dEnd = new Date(exactEnd);
  const intervals: { start: string, end: string }[] = [];

  while (dStart <= dEnd) {
    const chunkEnd = new Date(dStart);
    chunkEnd.setDate(chunkEnd.getDate() + MAX_DAYS);
    if (chunkEnd >= dEnd) {
      intervals.push({ start: format(dStart, 'yyyy-MM-dd'), end: format(dEnd, 'yyyy-MM-dd') });
      break;
    } else {
      intervals.push({ start: format(dStart, 'yyyy-MM-dd'), end: format(chunkEnd, 'yyyy-MM-dd') });
      dStart = new Date(chunkEnd);
      dStart.setDate(dStart.getDate() + 1);
    }
  }

  const allDownloads: DownloadStat[] = [];

  for (const interval of intervals) {
    const url = `${baseUrl}/downloads/range/${interval.start}:${interval.end}/${encodedPackageName}`;
    const response = await fetch(url);

    if (response.ok) {
      const data: NpmStatsResponse = await response.json();
      if (data && data.downloads) {
        allDownloads.push(...data.downloads);
      }
    } else if (response.status === 404) {
      if (intervals.length === 1) {
        throw new Error(`Package "${packageName}" not found or has no data.`);
      }
      // If historical chunk 404s, it might mean the package didn't exist yet, we just gracefully continue.
    } else {
      throw new Error(`Failed to fetch downloads data: ${response.statusText}`);
    }
  }

  if (allDownloads.length === 0) {
    throw new Error(`Package "${packageName}" not found or has no data.`);
  }

  return {
    start: exactStart,
    end: exactEnd,
    package: packageName,
    downloads: allDownloads
  };
}
