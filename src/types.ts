/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { DateRangeType } from './api/npmApi';

export type { DateRangeType };

export interface PackageConfig {
    name: string;
    visible: boolean;
}

export interface CombinedData {
    day: string;
    packages: { [pkgName: string]: number };
}

export interface PeriodMetrics {
    downloads: number;
    rateChangePercent: number;
    absoluteChange: number;
}

export interface ChartDataPoint {
    day: string;
    formattedDate: string;
    shortDate: string;
    pkgStats: Record<string, PeriodMetrics>;
    absMax: number;
    displayMax: number;
    displayMin: number;
}

export type GroupBy = 'day' | 'week' | 'month' | 'year';

export enum ViewMode {
    absolute = 'absolute',
    percent = 'percent',
    absoluteChange = 'absolute-change',
}

export enum ChartType {
    line = 'line',
    bar = 'bar',
}

export interface AppState {
    packages: PackageConfig[];
    range: DateRangeType;
    customStart: string;
    customEnd: string;
    enabledDays: number[];
    viewMode: ViewMode;
    chartType: ChartType;
}
