/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { BarChart2, LineChart } from 'lucide-react';
import { ComponentType, lazy, LazyExoticComponent } from 'react';

import { ChartDataPoint, PackageConfig } from './types';
import { ViewMode } from './viewMode';

const BarChartView = lazy(() => import('./components/BarChartView'));
const LineChartView = lazy(() => import('./components/LineChartView'));

export enum ChartType {
    line = 'line',
    bar = 'bar',
}

export interface ChartViewProps {
    chartData: ChartDataPoint[];
    visiblePackages: PackageConfig[];
    packages: PackageConfig[];
    viewMode: ViewMode;
    chartWidth: number;
    height: number;
}

export interface ChartTypeTrait {
    button: {
        label: string;
        tooltip: string;
        icon: ComponentType<{ size: number }>;
    };
    component: LazyExoticComponent<ComponentType<ChartViewProps>>;
}

export const chartTypeTraits: Record<ChartType, ChartTypeTrait> = {
    [ChartType.line]: {
        button: {
            label: 'Line',
            tooltip: 'Line Chart',
            icon: LineChart,
        },
        component: LineChartView,
    },
    [ChartType.bar]: {
        button: {
            label: 'Bar',
            tooltip: 'Bar Chart',
            icon: BarChart2,
        },
        component: BarChartView,
    },
};
