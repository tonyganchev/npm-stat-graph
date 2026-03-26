/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { BarChart2, LineChartIcon } from 'lucide-react';
import { FC } from 'react';

import { ChartType } from '../types';

export interface ChartTypeToggleProps {
    chartType: ChartType;
    setChartType: (type: ChartType) => void;
}

export const ChartTypeToggle: FC<ChartTypeToggleProps> = ({ chartType, setChartType }) => (
    <div className="view-mode-toggle filter-chips">
        <button
            onClick={() => setChartType(ChartType.line)}
            className={`filter-chip ${chartType === ChartType.line ? 'active' : ''}`}
            title="Line Chart"
        >
            <LineChartIcon size={16} />
            <span>Line</span>
        </button>
        <button
            onClick={() => setChartType(ChartType.bar)}
            className={`filter-chip ${chartType === ChartType.bar ? 'active' : ''}`}
            title="Bar Chart"
        >
            <BarChart2 size={16} />
            <span>Bar</span>
        </button>
    </div>
);
