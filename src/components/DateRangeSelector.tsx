/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { FC } from 'react';
import { DateRangeType } from '../types';
import { MIN_DATE } from '../utils';

interface DateRangeSelectorProps {
    range: DateRangeType;
    customStart: string;
    setCustomStart: (val: string) => void;
    customEnd: string;
    setCustomEnd: (val: string) => void;
    setRange: (r: DateRangeType) => void;
    onRangeChange: (newRange: DateRangeType) => void;
    isLoading: boolean;
}

export const DateRangeSelector: FC<DateRangeSelectorProps> = ({
    range,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    setRange,
    onRangeChange,
    isLoading
}) => {
    return (
        <div className="search-controls-left">
            <div className="time-toggles">
                {([
                    ['last-7-days', '7 Days'],
                    ['last-30-days', '30 Days'],
                    ['last-quarter', 'Quarter'],
                    ['last-6-months', '6 Months'],
                    ['last-year', '1 Year'],
                    ['last-2-years', '2 Years'],
                    ['last-5-years', '5 Years'],
                    ['last-10-years', '10 Years'],
                    ['wtd', 'WTD'],
                    ['mtd', 'MTD'],
                    ['ytd', 'YTD'],
                    ['custom', 'Custom']
                ] as const).map(([val, label]) => (
                    <button
                        key={val}
                        type="button"
                        className={`filter-chip ${range === val ? 'active' : ''}`}
                        onClick={() => onRangeChange(val)}
                        disabled={isLoading}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="date-range-inputs">
                <input
                    type="date"
                    className="input"
                    value={customStart}
                    onChange={(e) => { setCustomStart(e.target.value); setRange('custom'); }}
                    min={MIN_DATE}
                    disabled={isLoading}
                />
                <span className="date-separator">to</span>
                <input
                    type="date"
                    className="input"
                    value={customEnd}
                    onChange={(e) => { setCustomEnd(e.target.value); setRange('custom'); }}
                    min={MIN_DATE}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
};
