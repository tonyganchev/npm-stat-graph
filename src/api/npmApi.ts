/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

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

import { minDate } from '../utils';

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

  // Cap at minDate
  if (start && start < minDate) {
    start = minDate;
  }

  return { start, end };
}

interface NpmStatResponseData {
  [pkg: string]: {
    [date: string]: number;
  };
}

const apiCache = new Map<string, { data: NpmStatResponseData, timestamp: number }>();
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

async function fetchWithCache(url: string, isImmutable: boolean): Promise<NpmStatResponseData> {
  const cached = apiCache.get(url);
  if (cached) {
    const isExpired = Date.now() - cached.timestamp > CACHE_EXPIRY;
    if (isImmutable || !isExpired) {
      return cached.data;
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      return {};
    }
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  apiCache.set(url, { data, timestamp: Date.now() });
  return data;
}

export async function fetchPackageStats(
  packageName: string,
  rangeType: DateRangeType,
  customStart?: string,
  customEnd?: string
): Promise<NpmStatsResponse> {
  let exactStart = customStart || "";
  let exactEnd = customEnd || "";

  if (!exactStart || !exactEnd) {
    const { start, end } = calculateDateRange(rangeType);
    exactStart = start;
    exactEnd = end;
  }

  const encodedPackageName = encodeURIComponent(packageName);
  
  const allDownloads: DownloadStat[] = [];
  let fetchError: string | undefined = undefined;
  
  const url = `https://npm-stat.com/api/download-counts?package=${encodedPackageName}&from=${exactStart}&until=${exactEnd}`;

  const todayStr = new Date().toISOString().split('T')[0];
  const isImmutable = exactEnd < todayStr;

  try {
    const data = await fetchWithCache(url, isImmutable);
    if (data && data[packageName]) {
      const dates = Object.keys(data[packageName]).sort();
      for (const date of dates) {
        allDownloads.push({
          day: date,
          downloads: data[packageName][date]
        });
      }
    } else if (Object.keys(data).length === 0) {
      // Package not found or no data
    } else {
      fetchError = "Unexpected data format from API";
    }
  } catch (err) {
    fetchError = `Failed to fetch data: ${(err as Error).message || String(err)}`;
  }

  return {
    start: exactStart,
    end: exactEnd,
    package: packageName,
    downloads: allDownloads,
    error: fetchError
  };
}
