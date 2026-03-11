import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { SearchControls } from './components/SearchControls';
import { StatChart } from './components/StatChart';
import { fetchPackageStats, DateRangeType, calculateDateRange } from './api/npmApi';
import { defaultPackage, PackageConfig } from './utils';

export interface CombinedData {
    day: string;
    packages: { [pkgName: string]: number };
}

export type GroupBy = "day" | "week" | "month" | "year";

const loadInitialState = () => {
    let parsedState: any = null;

    const params = new URLSearchParams(window.location.search);
    const pkgsStr = params.get('packages');
    const rangeParam = params.get('range') as DateRangeType;
    const customStartParam = params.get('customStart') || '';
    const customEndParam = params.get('customEnd') || '';

    if (pkgsStr) {
        try {
            const pkgs = JSON.parse(decodeURIComponent(pkgsStr));
            if (pkgs.length > 0) {
                parsedState = { packages: pkgs, range: rangeParam || 'last-30-days', customStart: customStartParam, customEnd: customEndParam };
            }
        } catch (e) { }
    }

    if (!parsedState) {
        const saved = localStorage.getItem('npm-stats-state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.packages && parsed.packages.length > 0) {
                    parsedState = parsed;
                }
            } catch (e) { }
        }
    }

    if (!parsedState) {
        parsedState = {
            packages: [{ id: '1', name: defaultPackage, visible: true }],
            range: 'last-30-days',
            customStart: '',
            customEnd: ''
        };
    }

    if (parsedState.range !== 'custom') {
        const { start, end } = calculateDateRange(parsedState.range);
        parsedState.customStart = start;
        parsedState.customEnd = end;
    }

    return parsedState;
};

function App() {
    const initialState = loadInitialState();
    const [packages, setPackages] = useState<PackageConfig[]>(initialState.packages);
    const [range, setRange] = useState<DateRangeType>(initialState.range);
    const [customStart, setCustomStart] = useState<string>(initialState.customStart);
    const [customEnd, setCustomEnd] = useState<string>(initialState.customEnd);

    const [data, setData] = useState<CombinedData[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const activePkgs = packages.filter(p => p.name.trim() !== '');
            if (activePkgs.length === 0) {
                setData(null);
                setIsLoading(false);
                return;
            }

            // Sync URL and LocalStorage
            const state = { packages, range, customStart, customEnd };
            localStorage.setItem('npm-stats-state', JSON.stringify(state));
            const url = new URL(window.location.href);
            url.searchParams.set('packages', encodeURIComponent(JSON.stringify(packages)));
            url.searchParams.set('range', range);
            if (range === 'custom') {
                url.searchParams.set('customStart', customStart);
                url.searchParams.set('customEnd', customEnd);
            } else {
                url.searchParams.delete('customStart');
                url.searchParams.delete('customEnd');
            }
            window.history.replaceState({}, '', url.toString());

            const statsPromises = activePkgs.map(pkg => fetchPackageStats(pkg.name.trim(), range, customStart, customEnd));
            const results = await Promise.all(statsPromises);

            // Merge all results into CombinedData mapped by day
            const dayMap = new Map<string, { [pkgConf: string]: number }>();

            results.forEach((res, index) => {
                const pkgConfigId = activePkgs[index].id;
                res.downloads.forEach(d => {
                    if (!dayMap.has(d.day)) {
                        dayMap.set(d.day, {});
                    }
                    dayMap.get(d.day)![pkgConfigId] = d.downloads;
                });
            });

            const mergedData: CombinedData[] = Array.from(dayMap.entries()).map(([day, pkgsData]) => {
                return {
                    day,
                    packages: pkgsData
                };
            }).sort((a, b) => a.day.localeCompare(b.day));

            setData(mergedData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, [packages, range, customStart, customEnd]);

    // Initial search only once
    useEffect(() => {
        handleSearch();
    }, []);

    // Filter out visible packages for charting
    const visiblePackages = packages.filter(p => p.visible && p.name.trim() !== '');

    return (
        <div className="app-container">
            <header>
                <h1>
                    <TrendingUp style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'bottom' }} size={40} />
                    npm-stat-plan
                </h1>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
                <SearchControls
                    packages={packages}
                    setPackages={setPackages}
                    range={range}
                    setRange={setRange}
                    customStart={customStart}
                    setCustomStart={setCustomStart}
                    customEnd={customEnd}
                    setCustomEnd={setCustomEnd}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                />

                {error && (
                    <div className="glass-panel state-container">
                        <AlertCircle className="state-icon" style={{ color: 'var(--error-color)', opacity: 1 }} />
                        <div className="error-text">
                            <p style={{ color: 'inherit', fontWeight: 'bold' }}>Error fetching data</p>
                            <p style={{ color: 'inherit', marginTop: '0.25rem' }}>{error}</p>
                        </div>
                    </div>
                )}

                {!error && data && data.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <StatChart data={data} packages={packages} visiblePackages={visiblePackages} groupBy="day" />
                        <StatChart data={data} packages={packages} visiblePackages={visiblePackages} groupBy="week" />
                        <StatChart data={data} packages={packages} visiblePackages={visiblePackages} groupBy="month" />
                        <StatChart data={data} packages={packages} visiblePackages={visiblePackages} groupBy="year" />
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
