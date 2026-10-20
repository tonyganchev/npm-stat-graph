/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { addDays, format, startOfDay, startOfMonth, startOfWeek, startOfYear, subMonths } from 'date-fns';

import { isoDateFormat, minDate } from './utils';

export const dateRanges = [
    'last-7-days',
    'last-2-weeks',
    'last-30-days',
    'last-2-months',
    'last-quarter',
    'last-6-months',
    'last-year',
    'last-2-years',
    'last-3-years',
    'last-5-years',
    'last-10-years',
    'ytd',
    'mtd',
    'wtd',
    'custom',
] as const;

export type DateRangeType = typeof dateRanges[number];

const yesterday = addDays(startOfDay(new Date()), -1);

export interface DateRangeTraits {
    label: string;
    shortLabel: string;
    startDateFn: () => Date;
}

export const dateRangeTraits: Record<DateRangeType, DateRangeTraits> = {
    'last-7-days': {
        label: '7 Days',
        shortLabel: '7d',
        startDateFn: () => addDays(yesterday, -7),
    },
    'last-2-weeks': {
        label: '2 Weeks',
        shortLabel: '2w',
        startDateFn: () => addDays(yesterday, -14),
    },
    'last-30-days': {
        label: '30 Days',
        shortLabel: '30d',
        startDateFn: () => addDays(yesterday, -30),
    },
    'last-2-months': {
        label: '2 Months',
        shortLabel: '2mo',
        startDateFn: () => subMonths(yesterday, 2),
    },
    'last-quarter': {
        label: 'Quarter',
        shortLabel: '3mo',
        startDateFn: () => subMonths(yesterday, 3),
    },
    'last-6-months': {
        label: '6 Months',
        shortLabel: '6mo',
        startDateFn: () => subMonths(yesterday, 6),
    },
    'last-year': {
        label: '1 Year',
        shortLabel: '1y',
        startDateFn: () => subMonths(yesterday, 12),
    },
    'last-2-years': {
        label: '2 Years',
        shortLabel: '2y',
        startDateFn: () => subMonths(yesterday, 24),
    },
    'last-3-years': {
        label: '3 Years',
        shortLabel: '3y',
        startDateFn: () => subMonths(yesterday, 36),
    },
    'last-5-years': {
        label: '5 Years',
        shortLabel: '5y',
        startDateFn: () => subMonths(yesterday, 60),
    },
    'last-10-years': {
        label: '10 Years',
        shortLabel: '10y',
        startDateFn: () => subMonths(yesterday, 120),
    },
    ytd: {
        label: 'YTD',
        shortLabel: 'YTD',
        startDateFn: () => startOfYear(yesterday),
    },
    mtd: {
        label: 'MTD',
        shortLabel: 'MTD',
        startDateFn: () => startOfMonth(yesterday),
    },
    wtd: {
        label: 'WTD',
        shortLabel: 'WTD',
        startDateFn: () => startOfWeek(yesterday, { weekStartsOn: 1 }),
    },
    custom: {
        label: 'Custom',
        shortLabel: 'Custom',
        startDateFn: () => {
            throw new Error('should never be called');
        },
    },
} as const;

export function calculateDateRange(rangeType: DateRangeType): { start: string; end: string } {
    const yesterday = addDays(startOfDay(new Date()), -1);
    const start = dateRangeTraits[rangeType].startDateFn();
    const cappedStart = start < minDate ? minDate : start;

    return {
        start: format(cappedStart, isoDateFormat),
        end: format(yesterday, isoDateFormat),
    };
}
