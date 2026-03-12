import React from 'react';
import { Search, Loader2, Plus, Eye, EyeOff, X, ArrowUpDown } from 'lucide-react';
import { DateRangeType, calculateDateRange } from '../api/npmApi';
import { PackageConfig, packageColors } from '../utils';
import { AutocompleteInput } from './AutocompleteInput';

interface SearchControlsProps {
    packages: PackageConfig[];
    setPackages: React.Dispatch<React.SetStateAction<PackageConfig[]>>;
    range: DateRangeType;
    setRange: (r: DateRangeType) => void;
    customStart: string;
    setCustomStart: (val: string) => void;
    customEnd: string;
    setCustomEnd: (val: string) => void;
    onSearch: (overrides?: { range?: DateRangeType, customStart?: string, customEnd?: string }) => void;
    isLoading: boolean;
}

export const SearchControls: React.FC<SearchControlsProps> = ({
    packages, setPackages, range, setRange, customStart, setCustomStart, customEnd, setCustomEnd, onSearch, isLoading
}) => {
    const [hoveredSwapIndex, setHoveredSwapIndex] = React.useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
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
        <div className="glass-panel">
            <form onSubmit={handleSubmit} className="package-list">
                {packages.map((pkg, i) => (
                    <div key={pkg.id} className="package-input-row">
                        {i < packages.length - 1 && (
                            <div style={{
                                position: 'absolute',
                                bottom: '-0.25rem',
                                right: '2.5rem',
                                width: '5rem',
                                borderBottom: hoveredSwapIndex === i ? '1px dotted rgba(255, 255, 255, 0.5)' : '1px dotted transparent',
                                pointerEvents: 'none',
                            }} />
                        )}
                        <div 
                            className="package-color-indicator" 
                            style={{ background: packageColors[i % packageColors.length] }} 
                        />

                        <AutocompleteInput
                            value={pkg.name}
                            onChange={(val) => updatePackageName(i, val)}
                            placeholder={`Package ${i + 1} name`}
                            disabled={isLoading}
                            style={{
                                border: `1px solid ${packageColors[i % packageColors.length]}`,
                                outlineColor: packageColors[i % packageColors.length],
                                opacity: pkg.visible ? 1 : 0.5
                            }}
                        />

                        <button type="button" className="btn-icon" onClick={() => toggleVisibility(i)} title="Toggle Visibility">
                            {pkg.visible ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>

                        <button type="button" className="btn-icon error" onClick={() => removePackage(i)} title="Remove Package">
                            <X size={20} />
                        </button>

                        <div style={{ width: '2rem', display: 'flex', justifyContent: 'center', position: 'relative', alignSelf: 'stretch' }}>
                            {i < packages.length - 1 && (
                                <button
                                    type="button"
                                    className="btn-icon"
                                    onMouseEnter={() => setHoveredSwapIndex(i)}
                                    onMouseLeave={() => setHoveredSwapIndex(null)}
                                    onClick={() => movePackage(i, 1)}
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        marginTop: '0.25rem',
                                        transform: 'translateY(-50%)',
                                        zIndex: 10,
                                    }}
                                    title="Swap with below"
                                >
                                    <ArrowUpDown size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                <div style={{ display: 'flex', marginTop: '0.5rem' }}>
                    <button type="button" className="btn" onClick={addPackage} disabled={isLoading}>
                        <Plus size={16} /> Add Package
                    </button>
                </div>
            </form>

            <div className="search-controls" style={{ marginTop: '2rem' }}>
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
                    <span style={{ color: 'var(--text-secondary)' }}>to</span>
                    <input
                        type="date"
                        className="input"
                        value={customEnd}
                        onChange={(e) => { setCustomEnd(e.target.value); setRange('custom'); }}
                        disabled={isLoading}
                    />
                </div>

                <button 
                    type="button" 
                    onClick={() => onSearch()} 
                    className="btn btn-primary" 
                    disabled={isLoading || !hasPackages}
                >
                    {isLoading ? <Loader2 className="spinning" size={20} /> : <Search size={20} />}
                    Search
                </button>
            </div>
        </div>
    );
};
