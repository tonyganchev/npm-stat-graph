/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { FC } from 'react';

import { ChartType, chartTypeTraits } from '../chartType';

export interface ChartTypeToggleProps {
    chartType: ChartType;
    setChartType: (type: ChartType) => void;
}

export const ChartTypeToggle: FC<ChartTypeToggleProps> = ({ chartType, setChartType }) => (
    <div className="view-mode-toggle filter-chips">
        {Object.entries(chartTypeTraits).map(([ct, trait]) => (
            <button
                onClick={() => setChartType(ct as ChartType)}
                className={`filter-chip ${chartType === ct ? 'active' : ''}`}
                title={trait.button.tooltip}
            >
                <trait.button.icon size={16} />
                <span>{trait.button.label}</span>
            </button>
        ))}
    </div>
);
