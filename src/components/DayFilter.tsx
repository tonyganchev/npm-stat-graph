/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { FC } from 'react';

import { ViewMode, ChartType } from '../types';
import { BarChart3, Percent, LineChart as LineChartIcon, BarChart2 } from 'lucide-react';
import { DAYS_OF_WEEK } from '../utils';

interface DayFilterProps {
    enabledDays: number[];
    setEnabledDays: (days: number[]) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    chartType: ChartType;
    setChartType: (type: ChartType) => void;
}

export const DayFilter: FC<DayFilterProps> = ({ 
    enabledDays, setEnabledDays, viewMode, setViewMode, chartType, setChartType 
}) => {
    const toggleDay = (day: number) => {
        if (enabledDays.includes(day)) {
            if (enabledDays.length > 1) {
                setEnabledDays(enabledDays.filter(d => d !== day));
            }
        } else {
            setEnabledDays([...enabledDays, day].sort());
        }
    };

    return (
        <div className="filter-panel">
            <div className="filter-chips">
                {DAYS_OF_WEEK.map((day) => {
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
                    onClick={() => setViewMode('absolute')}
                    className={`filter-chip ${viewMode === 'absolute' ? 'active' : ''}`}
                    title="Absolute Downloads"
                >
                    <BarChart3 size={16} />
                    <span>Absolute</span>
                </button>
                <button
                    onClick={() => setViewMode('percent')}
                    className={`filter-chip ${viewMode === 'percent' ? 'active' : ''}`}
                    title="Percentage Change"
                >
                    <Percent size={14} />
                    <span>Change</span>
                </button>
            </div>

            <div className="view-mode-toggle filter-chips">
                <button
                    onClick={() => setChartType('line')}
                    className={`filter-chip ${chartType === 'line' ? 'active' : ''}`}
                    title="Line Chart"
                >
                    <LineChartIcon size={16} />
                    <span>Line</span>
                </button>
                <button
                    onClick={() => setChartType('bar')}
                    className={`filter-chip ${chartType === 'bar' ? 'active' : ''}`}
                    title="Bar Chart"
                >
                    <BarChart2 size={16} />
                    <span>Bar</span>
                </button>
            </div>
        </div>
    );
};
