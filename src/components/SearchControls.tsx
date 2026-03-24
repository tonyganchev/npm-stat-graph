/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { Loader2, Search } from 'lucide-react';
import { FC, FormEvent } from 'react';

import { calculateDateRange } from '../api/npmApi';
import { DateRangeType, PackageConfig } from '../types';
import { DateRangeSelector } from './DateRangeSelector';
import { PackageSelector } from './PackageSelector';

interface SearchControlsProps {
    packages: PackageConfig[];
    setPackages: (pkgs: PackageConfig[]) => void;
    range: DateRangeType;
    setRange: (r: DateRangeType) => void;
    customStart: string;
    setCustomStart: (val: string) => void;
    customEnd: string;
    setCustomEnd: (val: string) => void;
    onSearch: () => void;
    isLoading: boolean;
}

export const SearchControls: FC<SearchControlsProps> = ({
    packages, setPackages, range, setRange, customStart, setCustomStart, customEnd, setCustomEnd, onSearch, isLoading,
}) => {
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSearch();
    };

    const handleRangeChange = (newRange: DateRangeType) => {
        setRange(newRange);

        if (newRange !== 'custom') {
            const { start, end } = calculateDateRange(newRange);
            setCustomStart(start);
            setCustomEnd(end);
        }
    };

    const hasPackages = packages.some((p) => p.name.length > 0);

    return (
        <form onSubmit={handleSubmit} className="search-controls-wrapper">
            <PackageSelector
                packages={packages}
                setPackages={setPackages}
                isLoading={isLoading}
            />

            <div className="search-controls">
                <DateRangeSelector
                    range={range}
                    customStart={customStart}
                    setCustomStart={setCustomStart}
                    customEnd={customEnd}
                    setCustomEnd={setCustomEnd}
                    setRange={setRange}
                    onRangeChange={handleRangeChange}
                    isLoading={isLoading}
                />

                <button
                    type="submit"
                    className="btn btn-primary btn-search-main"
                    disabled={isLoading || !hasPackages}
                >
                    {isLoading ? <Loader2 className="spinning" size={20} /> : <Search size={20} />}
                    Search
                </button>
            </div>
        </form>
    );
};
