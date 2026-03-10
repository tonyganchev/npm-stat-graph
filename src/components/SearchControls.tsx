import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchControlsProps {
    onSearch: (pkg: string, range: "last-7-days" | "last-30-days" | "last-year") => void;
    isLoading: boolean;
}

export const SearchControls: React.FC<SearchControlsProps> = ({ onSearch, isLoading }) => {
    const [pkg, setPkg] = useState('react');
    const [range, setRange] = useState<"last-7-days" | "last-30-days" | "last-year">('last-30-days');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pkg.trim()) {
            onSearch(pkg.trim(), range);
        }
    };

    const handleRangeChange = (newRange: "last-7-days" | "last-30-days" | "last-year") => {
        setRange(newRange);
        if (pkg.trim()) {
            onSearch(pkg.trim(), newRange);
        }
    };

    return (
        <div className="search-section glass-panel">
            <form onSubmit={handleSubmit} className="input-group">
                <input
                    type="text"
                    className="input"
                    placeholder="e.g. react, lodash, express..."
                    value={pkg}
                    onChange={(e) => setPkg(e.target.value)}
                    disabled={isLoading}
                />
                <button type="submit" className="btn" disabled={isLoading || !pkg.trim()}>
                    {isLoading ? <Loader2 className="spinning" size={20} /> : <Search size={20} />}
                    Search
                </button>
            </form>

            <div className="search-controls">
                <p>Analyze npm package downloads</p>
                <div className="time-toggles">
                    <button
                        type="button"
                        className={`btn btn-outline ${range === 'last-7-days' ? 'active' : ''}`}
                        onClick={() => handleRangeChange('last-7-days')}
                        disabled={isLoading}
                    >
                        7 Days
                    </button>
                    <button
                        type="button"
                        className={`btn btn-outline ${range === 'last-30-days' ? 'active' : ''}`}
                        onClick={() => handleRangeChange('last-30-days')}
                        disabled={isLoading}
                    >
                        30 Days
                    </button>
                    <button
                        type="button"
                        className={`btn btn-outline ${range === 'last-year' ? 'active' : ''}`}
                        onClick={() => handleRangeChange('last-year')}
                        disabled={isLoading}
                    >
                        1 Year
                    </button>
                </div >
            </div >
        </div >
    );
};
