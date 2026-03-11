import React from 'react';
import { Search, Loader2, Plus, Eye, EyeOff, X, ArrowUp, ArrowDown } from 'lucide-react';
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
        <div className="search-section glass-panel">
            <form onSubmit={handleSubmit} className="input-group" style={{ flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                    {packages.map((pkg, i) => (
                        <div key={pkg.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                            <div style={{ width: '4px', height: '100%', minHeight: '36px', background: packageColors[i % packageColors.length], borderRadius: '2px' }} />

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

                            <button type="button" className="btn-icon" onClick={() => toggleVisibility(i)} title="Toggle Visibility" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>
                                {pkg.visible ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>

                            <button type="button" className="btn-icon" onClick={() => movePackage(i, -1)} disabled={i === 0} style={{ background: 'transparent', border: 'none', color: i === 0 ? 'rgba(255,255,255,0.1)' : 'var(--text-secondary)', cursor: i === 0 ? 'default' : 'pointer', padding: '0.25rem' }}>
                                <ArrowUp size={16} />
                            </button>

                            <button type="button" className="btn-icon" onClick={() => movePackage(i, 1)} disabled={i === packages.length - 1} style={{ background: 'transparent', border: 'none', color: i === packages.length - 1 ? 'rgba(255,255,255,0.1)' : 'var(--text-secondary)', cursor: i === packages.length - 1 ? 'default' : 'pointer', padding: '0.25rem' }}>
                                <ArrowDown size={16} />
                            </button>

                            <button type="button" className="btn-icon" onClick={() => removePackage(i)} style={{ background: 'transparent', border: 'none', color: 'var(--error-color)', cursor: 'pointer', padding: '0.5rem' }}>
                                <X size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
                    <button type="button" className="btn btn-outline" onClick={addPackage} disabled={isLoading} style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem' }}>
                        <Plus size={16} /> Add Package
                    </button>
                </div>
            </form>

            <div className="search-controls" style={{ marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', display: 'flex' }}>
                <div className="time-toggles" style={{ flexWrap: 'wrap', display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className={`btn btn-outline ${range === 'last-7-days' ? 'active' : ''}`} onClick={() => handleRangeChange('last-7-days')} disabled={isLoading}>7 Days</button>
                    <button type="button" className={`btn btn-outline ${range === 'last-30-days' ? 'active' : ''}`} onClick={() => handleRangeChange('last-30-days')} disabled={isLoading}>30 Days</button>
                    <button type="button" className={`btn btn-outline ${range === 'last-quarter' ? 'active' : ''}`} onClick={() => handleRangeChange('last-quarter')} disabled={isLoading}>Quarter</button>
                    <button type="button" className={`btn btn-outline ${range === 'last-6-months' ? 'active' : ''}`} onClick={() => handleRangeChange('last-6-months')} disabled={isLoading}>6 Months</button>
                    <button type="button" className={`btn btn-outline ${range === 'last-year' ? 'active' : ''}`} onClick={() => handleRangeChange('last-year')} disabled={isLoading}>1 Year</button>
                    <button type="button" className={`btn btn-outline ${range === 'last-2-years' ? 'active' : ''}`} onClick={() => handleRangeChange('last-2-years')} disabled={isLoading}>2 Years</button>
                    <button type="button" className={`btn btn-outline ${range === 'last-5-years' ? 'active' : ''}`} onClick={() => handleRangeChange('last-5-years')} disabled={isLoading}>5 Years</button>
                    <button type="button" className={`btn btn-outline ${range === 'last-10-years' ? 'active' : ''}`} onClick={() => handleRangeChange('last-10-years')} disabled={isLoading}>10 Years</button>
                    <button type="button" className={`btn btn-outline ${range === 'wtd' ? 'active' : ''}`} onClick={() => handleRangeChange('wtd')} disabled={isLoading}>WTD</button>
                    <button type="button" className={`btn btn-outline ${range === 'mtd' ? 'active' : ''}`} onClick={() => handleRangeChange('mtd')} disabled={isLoading}>MTD</button>
                    <button type="button" className={`btn btn-outline ${range === 'ytd' ? 'active' : ''}`} onClick={() => handleRangeChange('ytd')} disabled={isLoading}>YTD</button>
                    <button type="button" className={`btn btn-outline ${range === 'custom' ? 'active' : ''}`} onClick={() => handleRangeChange('custom')} disabled={isLoading}>Custom</button>
                </div>

                <div style={{ display: 'flex', flex: 1, gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                            type="date"
                            className="input"
                            value={customStart}
                            onChange={(e) => { setCustomStart(e.target.value); setRange('custom'); }}
                            disabled={isLoading}
                        />
                        <span>to</span>
                        <input
                            type="date"
                            className="input"
                            value={customEnd}
                            onChange={(e) => { setCustomEnd(e.target.value); setRange('custom'); }}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <button type="button" onClick={() => onSearch()} className="btn" disabled={isLoading || !hasPackages} style={{ whiteSpace: 'nowrap' }}>
                    {isLoading ? <Loader2 className="spinning" size={20} /> : <Search size={20} />}
                    Search
                </button>

            </div>
        </div>
    );
};
