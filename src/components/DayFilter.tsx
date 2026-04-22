/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { FC } from 'react';

import { daysOfWeek } from '../utils';

interface DayFilterProps {
    enabledDays: number[];
    setEnabledDays: (days: number[]) => void;
}

export const DayFilter: FC<DayFilterProps> = ({ enabledDays, setEnabledDays }) => {
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
        <div className="filter-chips">
            {Object.entries(daysOfWeek).map(([label, day]) => {
                const isActive = enabledDays.includes(day);
                return (
                    <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`filter-chip ${isActive ? 'active' : ''}`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
};
