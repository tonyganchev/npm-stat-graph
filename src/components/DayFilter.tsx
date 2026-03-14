import { FC } from 'react';

export const DAYS_OF_WEEK = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
];

import { ViewMode } from '../types';
import { BarChart3, Percent } from 'lucide-react';

interface DayFilterProps {
    enabledDays: number[];
    setEnabledDays: (days: number[]) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

export const DayFilter: FC<DayFilterProps> = ({ enabledDays, setEnabledDays, viewMode, setViewMode }) => {
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
        </div>
    );
};
