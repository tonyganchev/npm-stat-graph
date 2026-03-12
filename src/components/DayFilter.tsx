import React from 'react';
import { Calendar } from 'lucide-react';

export const DAYS_OF_WEEK = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
];

interface DayFilterProps {
    enabledDays: number[];
    setEnabledDays: (days: number[]) => void;
}

export const DayFilter: React.FC<DayFilterProps> = ({ enabledDays, setEnabledDays }) => {
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
        </div>
    );
};
