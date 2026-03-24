/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { addDays, format, startOfDay, startOfMonth, startOfWeek, startOfYear, subMonths } from 'date-fns';

import { minDate } from '../utils';

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

export type DateRangeType =
    | 'last-7-days'
    | 'last-30-days'
    | 'last-quarter'
    | 'last-6-months'
    | 'last-year'
    | 'last-2-years'
    | 'last-5-years'
    | 'last-10-years'
    | 'ytd'
    | 'mtd'
    | 'wtd'
    | 'custom';

export function calculateDateRange(rangeType: DateRangeType): { start: string; end: string } {
    const today = startOfDay(new Date());
    let start = '';
    let end = format(today, 'yyyy-MM-dd');

    if (rangeType === 'last-7-days') {
        start = format(addDays(today, -7), 'yyyy-MM-dd');
    } else if (rangeType === 'last-30-days') {
        start = format(addDays(today, -30), 'yyyy-MM-dd');
    } else if (rangeType === 'last-year') {
        start = format(subMonths(today, 12), 'yyyy-MM-dd');
    } else if (rangeType === 'last-quarter') {
        start = format(subMonths(today, 3), 'yyyy-MM-dd');
    } else if (rangeType === 'last-6-months') {
        start = format(subMonths(today, 6), 'yyyy-MM-dd');
    } else if (rangeType === 'last-2-years') {
        start = format(subMonths(today, 24), 'yyyy-MM-dd');
    } else if (rangeType === 'last-5-years') {
        start = format(subMonths(today, 60), 'yyyy-MM-dd');
    } else if (rangeType === 'last-10-years') {
        start = format(subMonths(today, 120), 'yyyy-MM-dd');
    } else if (rangeType === 'ytd') {
        start = format(startOfYear(today), 'yyyy-MM-dd');
    } else if (rangeType === 'mtd') {
        start = format(startOfMonth(today), 'yyyy-MM-dd');
    } else if (rangeType === 'wtd') {
    // start of week, assuming Monday is the first day of the week
        start = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    }

    // Cap at minDate
    if (start && start < minDate) {
        start = minDate;
    }

    return { start, end };
}

const apiCache = new Map<string, { data: NpmStatsResponse; timestamp: number }>();
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

async function fetchWithCache(url: string, isImmutable: boolean): Promise<Partial<NpmStatsResponse>> {
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
            return { downloads: [] };
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
    customEnd?: string,
): Promise<NpmStatsResponse> {
    let exactStart = customStart || '';
    let exactEnd = customEnd || '';

    if (!exactStart || !exactEnd) {
        const { start, end } = calculateDateRange(rangeType);
        exactStart = start;
        exactEnd = end;
    }

    const encodedPackageName = encodeURIComponent(packageName);

    const baseUrl = 'https://api.npmjs.org';
    const todayStr = new Date().toISOString().split('T')[0];

    const startYear = parseInt(exactStart.substring(0, 4), 10);
    const endYear = parseInt(exactEnd.substring(0, 4), 10);
    const intervals: { start: string; end: string }[] = [];

    for (let y = startYear; y <= endYear; y++) {
        const isFirstYear = y === startYear;
        const isLastYear = y === endYear;
        const start = isFirstYear ? exactStart : `${y}-01-01`;
        const end = isLastYear ? exactEnd : `${y}-12-31`;
        intervals.push({ start, end });
    }

    const allDownloads: DownloadStat[] = [];
    let fetchError: string | undefined = undefined;

    // Use Promise.all to fetch all yearly chunks perfectly in parallel!
    try {
        const fetchPromises = intervals.map(async (interval) => {
            const url = `${baseUrl}/downloads/range/${interval.start}:${interval.end}/${encodedPackageName}`;
            const isImmutable = interval.end < todayStr;
            const data = await fetchWithCache(url, isImmutable);
            return data;
        });

        const results = await Promise.all(fetchPromises);

        for (const data of results) {
            if (data && data.downloads) {
                allDownloads.push(...data.downloads);
            }
        }
    } catch (err) {
        fetchError = `Failed to fetch data chunks from npm API: ${(err as Error).message || String(err)}`;
    }

    // Ensure dates are sorted chronologically since Promise.all results may
    // vary slightly based on server response latency.
    allDownloads.sort((a, b) => a.day.localeCompare(b.day));

    return {
        start: exactStart,
        end: exactEnd,
        package: packageName,
        downloads: allDownloads,
        error: fetchError,
    };
}
