import { FC, FormEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { PackageConfig, DateRangeType } from '../types';
import { calculateDateRange } from '../api/npmApi';
import { PackageSelector } from './PackageSelector';
import { DateRangeSelector } from './DateRangeSelector';

interface SearchControlsProps {
    packages: PackageConfig[];
    setPackages: (pkgs: PackageConfig[]) => void;
    range: DateRangeType;
    setRange: (r: DateRangeType) => void;
    customStart: string;
    setCustomStart: (val: string) => void;
    customEnd: string;
    setCustomEnd: (val: string) => void;
    onSearch: (overrides?: { range?: DateRangeType, customStart?: string, customEnd?: string }) => void;
    isLoading: boolean;
}

export const SearchControls: FC<SearchControlsProps> = ({
    packages, setPackages, range, setRange, customStart, setCustomStart, customEnd, setCustomEnd, onSearch, isLoading
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
            onSearch({ range: newRange, customStart: start, customEnd: end });
        }
    };

    const hasPackages = packages.some(p => p.name.length > 0);

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <PackageSelector
                    packages={packages}
                    setPackages={setPackages}
                    isLoading={isLoading}
                />
            </form>

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
                    type="button"
                    onClick={() => onSearch()}
                    className="btn btn-primary btn-search-main"
                    disabled={isLoading || !hasPackages}
                >
                    {isLoading ? <Loader2 className="spinning" size={20} /> : <Search size={20} />}
                    Search
                </button>
            </div>

        </div>
    );
};
