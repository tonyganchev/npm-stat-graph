/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

export const defaultPackage = 'react';

export const isoDateFormat = 'yyyy-MM-dd';
export const minDate = new Date(2010, 0, 12); // Jan 12, 2010

export const packageColors = [
    '#f472b6', // Pink
    '#60a5fa', // Blue
    '#4ade80', // Green
    '#f59e0b', // Yellow
    '#a78bfa', // Purple
    '#f87171', // Red
    '#2dd4bf', // Teal
    '#fb923c', // Orange
];

export const daysOfWeek = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 0 },
];

export const numberFormatBasic = new Intl.NumberFormat('en-US');
export const numberFormatChange = new Intl.NumberFormat('en-US', { signDisplay: 'exceptZero' });
export const numberFormatChangePercent = new Intl.NumberFormat('en-US', {
    signDisplay: 'exceptZero',
    style: 'percent',
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
});
export const numberFormatBasicPercent = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
});

export const formatCompact = (num: number) => {
    const abs = Math.abs(num);
    if (abs >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (abs >= 1000) {
        return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toFixed(0);
};
