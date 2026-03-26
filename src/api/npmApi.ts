/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { addDays, format, startOfDay, startOfMonth, startOfWeek, startOfYear, subMonths } from 'date-fns';

import { isoDateFormat, minDate } from '../utils';

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

function periodStartDate(rangeType: DateRangeType) {
    const today = startOfDay(new Date());
    if (rangeType === 'last-7-days') {
        return addDays(today, -7);
    } else if (rangeType === 'last-30-days') {
        return addDays(today, -30);
    } else if (rangeType === 'last-year') {
        return subMonths(today, 12);
    } else if (rangeType === 'last-quarter') {
        return subMonths(today, 3);
    } else if (rangeType === 'last-6-months') {
        return subMonths(today, 6);
    } else if (rangeType === 'last-2-years') {
        return subMonths(lastFullDay, 24);
    } else if (rangeType === 'last-5-years') {
        return subMonths(today, 60);
    } else if (rangeType === 'last-10-years') {
        return subMonths(today, 120);
    } else if (rangeType === 'ytd') {
        return startOfYear(today);
    } else if (rangeType === 'mtd') {
        return startOfMonth(today);
    } else if (rangeType === 'wtd') {
        // start of week, assuming Monday is the first day of the week
        return startOfWeek(today, { weekStartsOn: 1 });
    }
    throw new Error('unexpected period type: ' + rangeType);
}

export function calculateDateRange(rangeType: DateRangeType): { start: string; end: string } {
    const today = startOfDay(new Date());
    const start = periodStartDate(rangeType);
    const cappedStart = start < minDate ? minDate : start;

    return {
        start: format(cappedStart, isoDateFormat),
        end: format(today, isoDateFormat),
    };
}

const apiCache = new Map<string, { data: NpmStatsResponse; timestamp: number }>();
const cacheExpiry = 5 * 60 * 1000; // 5 minutes (down from 10)
const maxCacheEntries = 50;

async function fetchWithCache(url: string, isImmutable: boolean): Promise<Partial<NpmStatsResponse>> {
    const cached = apiCache.get(url);
    if (cached) {
        const isExpired = Date.now() - cached.timestamp > cacheExpiry;
        if (isImmutable || !isExpired) {
            // Keep recent items at the end of the Map for LRU behavior
            apiCache.delete(url);
            apiCache.set(url, cached);
            return cached.data;
        }
    }

    const response = await fetch(url, {
        cache: isImmutable ? 'default' : 'no-cache',
    });

    if (!response.ok) {
        if (response.status === 404) {
            return { downloads: [] };
        }
        throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Implementation of simple LRU eviction
    if (apiCache.size >= maxCacheEntries) {
        const firstKey = apiCache.keys().next().value;
        if (firstKey) apiCache.delete(firstKey);
    }

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
    const today = new Date();

    // Data older than 3 days is considered stable enough to cache permanently.
    // NPM data for "yesterday" often updates/flattens for 48-72 hours.
    const thresholdDate = new Date(today);
    thresholdDate.setDate(thresholdDate.getDate() - 3);
    const thresholdDateStr = thresholdDate.toISOString().split('T')[0];

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
            const isImmutable = interval.end < thresholdDateStr;
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
