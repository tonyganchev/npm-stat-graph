/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { addMonths, format, startOfDay } from 'date-fns';
import { FC, Fragment } from 'react';

import { dateRangeTraits, DateRangeType } from '../dateRange';
import { isoDateFormat, minDate } from '../utils';

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
    isLoading,
}) => {
    return (
        <Fragment>
            <div className="time-toggles">
                {Object.entries(dateRangeTraits).map(([val, { label }]) => (
                    <button
                        key={val}
                        className={`filter-chip ${range === val ? 'active' : ''}`}
                        onClick={() => onRangeChange(val as DateRangeType)}
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
                    onChange={(e) => {
                        setCustomStart(e.target.value);
                        setRange('custom');
                    }}
                    min={format(minDate, isoDateFormat)}
                    max={format(addMonths(startOfDay(new Date()), 18), isoDateFormat)}
                    disabled={isLoading}
                />
                to
                <input
                    type="date"
                    className="input"
                    value={customEnd}
                    onChange={(e) => {
                        setCustomEnd(e.target.value);
                        setRange('custom');
                    }}
                    min={format(minDate, isoDateFormat)}
                    max={format(addMonths(startOfDay(new Date()), 18), isoDateFormat)}
                    disabled={isLoading}
                />
            </div>
        </Fragment>
    );
};
