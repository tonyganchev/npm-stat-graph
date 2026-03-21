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
    id: string;
    name: string;
    visible: boolean;
}

export interface CombinedData {
    day: string;
    packages: { [pkgId: string]: number };
}

export type GroupBy = "day" | "week" | "month" | "year";

export type ViewMode = "absolute" | "percent";

export type ChartType = "line" | "bar";

export interface AppState {
    packages: PackageConfig[];
    range: DateRangeType;
    customStart: string;
    customEnd: string;
    enabledDays: number[];
    viewMode: ViewMode;
    chartType: ChartType;
}
