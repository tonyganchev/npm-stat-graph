/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { PackageConfig } from './types';

export const defaultPackage = 'react';
export const MIN_DATE = '2010-01-12';

export const packageColors = [
    '#f472b6', // Pink
    '#60a5fa', // Blue
    '#4ade80', // Green
    '#f59e0b', // Yellow
    '#a78bfa', // Purple
    '#f87171', // Red
    '#2dd4bf', // Teal
    '#fb923c'  // Orange
];

export const DAYS_OF_WEEK = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
];

export type { PackageConfig };
