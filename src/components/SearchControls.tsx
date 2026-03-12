import { FC, FormEvent, useState } from 'react';
import { Search, Loader2, Plus, Eye, EyeOff, X, ArrowUpDown } from 'lucide-react';
import { PackageConfig, DateRangeType } from '../types';
import { calculateDateRange } from '../api/npmApi';
import { packageColors } from '../utils';
import { AutocompleteInput } from './AutocompleteInput';

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
    const [hoveredSwapIndex, setHoveredSwapIndex] = useState<number | null>(null);

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

    const addPackage = () => {
        setPackages([...packages, { id: Math.random().toString(), name: '', visible: true }]);
    };

    const removePackage = (index: number) => {
        const newPkgs = [...packages];
        newPkgs.splice(index, 1);
        setPackages(newPkgs);
    };

    const toggleVisibility = (index: number) => {
        const newPkgs = [...packages];
        newPkgs[index].visible = !newPkgs[index].visible;
        setPackages(newPkgs);
    };

    const movePackage = (index: number, direction: -1 | 1) => {
        if (index + direction < 0 || index + direction >= packages.length) return;
        const newPkgs = [...packages];
        const temp = newPkgs[index];
        newPkgs[index] = newPkgs[index + direction];
        newPkgs[index + direction] = temp;
        setPackages(newPkgs);
    };

    const updatePackageName = (index: number, val: string) => {
        const newPkgs = [...packages];
        newPkgs[index].name = val;
        setPackages(newPkgs);
    };

    const hasPackages = packages.some(p => p.name.trim().length > 0);

    return (
        <div>
            <form onSubmit={handleSubmit} className="package-list">
                {packages.map((pkg, i) => (
                    <div key={pkg.id} className="package-input-row">
                        {i < packages.length - 1 && (
                            <div className={`swap-hint ${hoveredSwapIndex === i ? 'visible' : ''}`} />
                        )}
                        <div
                            className="package-color-indicator"
                            style={{ background: packageColors[i % packageColors.length] }}
                        />

                        <AutocompleteInput
                            value={pkg.name}
                            onChange={(val: string) => updatePackageName(i, val)}
                            placeholder={`Package ${i + 1} name`}
                            disabled={isLoading}
                            style={{
                                '--pkg-color': packageColors[i % packageColors.length],
                                opacity: pkg.visible ? 1 : 0.5
                            } as React.CSSProperties}
                        />

                        <button type="button" className="btn-icon" onClick={() => toggleVisibility(i)} title="Toggle Visibility">
                            {pkg.visible ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>

                        <button type="button" className="btn-icon error" onClick={() => removePackage(i)} title="Remove Package">
                            <X size={20} />
                        </button>

                        <div className="swap-button-wrapper">
                            {i < packages.length - 1 && (
                                <button
                                    type="button"
                                    className="btn-icon btn-swap"
                                    onMouseEnter={() => setHoveredSwapIndex(i)}
                                    onMouseLeave={() => setHoveredSwapIndex(null)}
                                    onClick={() => movePackage(i, 1)}
                                    title="Swap with below"
                                >
                                    <ArrowUpDown size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                <div className="search-actions">
                    <button type="button" className="btn" onClick={addPackage} disabled={isLoading}>
                        <Plus size={16} /> Add Package
                    </button>
                </div>
            </form>

            <div className="search-controls">
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
                                onClick={() => handleRangeChange(val)}
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
                            disabled={isLoading}
                        />
                        <span className="date-separator">to</span>
                        <input
                            type="date"
                            className="input"
                            value={customEnd}
                            onChange={(e) => { setCustomEnd(e.target.value); setRange('custom'); }}
                            disabled={isLoading}
                        />
                    </div>
                </div>

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
