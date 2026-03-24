/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { BarChart2, BarChart3, LineChart as LineChartIcon, Percent } from 'lucide-react';
import { FC } from 'react';

import { ChartType, ViewMode } from '../types';
import { daysOfWeek } from '../utils';

interface DayFilterProps {
    enabledDays: number[];
    setEnabledDays: (days: number[]) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    chartType: ChartType;
    setChartType: (type: ChartType) => void;
}

export const DayFilter: FC<DayFilterProps> = ({
    enabledDays,
    setEnabledDays,
    viewMode,
    setViewMode,
    chartType,
    setChartType,
}) => {
    const toggleDay = (day: number) => {
        if (enabledDays.includes(day)) {
            if (enabledDays.length > 1) {
                setEnabledDays(enabledDays.filter((d) => d !== day));
            }
        } else {
            setEnabledDays([...enabledDays, day].sort());
        }
    };

    return (
        <div className="filter-panel">
            <div className="filter-chips">
                {daysOfWeek.map((day) => {
                    const isActive = enabledDays.includes(day.value);
                    return (
                        <button
                            key={day.value}
                            onClick={() => toggleDay(day.value)}
                            className={`filter-chip ${isActive ? 'active' : ''}`}
                        >
                            {day.label}
                        </button>
                    );
                })}
            </div>

            <div className="view-mode-toggle filter-chips">
                <button
                    onClick={() => setViewMode(ViewMode.absolute)}
                    className={`filter-chip ${viewMode === ViewMode.absolute ? 'active' : ''}`}
                    title="Absolute Downloads"
                >
                    <BarChart3 size={16} />
                    <span>Absolute</span>
                </button>
                <button
                    onClick={() => setViewMode(ViewMode.percent)}
                    className={`filter-chip ${viewMode === ViewMode.percent ? 'active' : ''}`}
                    title="Percentage Change"
                >
                    <Percent size={14} />
                    <span>Change</span>
                </button>
            </div>

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
        </div>
    );
};
