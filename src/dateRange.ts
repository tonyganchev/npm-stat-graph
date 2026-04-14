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
    'last-30-days',
    'last-quarter',
    'last-6-months',
    'last-year',
    'last-2-years',
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
    startDateFn: () => Date;
}

export const dateRangeTraits: Record<DateRangeType, DateRangeTraits> = {
    'last-7-days': {
        label: '7 Days',
        startDateFn: () => addDays(yesterday, -7),
    },
    'last-30-days': {
        label: '30 Days',
        startDateFn: () => addDays(yesterday, -30),
    },
    'last-quarter': {
        label: 'Quarter',
        startDateFn: () => subMonths(yesterday, 3),
    },
    'last-6-months': {
        label: '6 Months',
        startDateFn: () => subMonths(yesterday, 6),
    },
    'last-year': {
        label: '1 Year',
        startDateFn: () => subMonths(yesterday, 12),
    },
    'last-2-years': {
        label: '2 Years',
        startDateFn: () => subMonths(yesterday, 24),
    },
    'last-5-years': {
        label: '5 Years',
        startDateFn: () => subMonths(yesterday, 60),
    },
    'last-10-years': {
        label: '10 Years',
        startDateFn: () => subMonths(yesterday, 120),
    },
    ytd: {
        label: 'YTD',
        startDateFn: () => startOfYear(yesterday),
    },
    mtd: {
        label: 'MTD',
        startDateFn: () => startOfMonth(yesterday),
    },
    wtd: {
        label: 'WTD',
        startDateFn: () => startOfWeek(yesterday, { weekStartsOn: 1 }),
    },
    custom: {
        label: 'Custom',
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
