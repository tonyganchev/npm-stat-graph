import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { SearchControls } from './components/SearchControls';
import { StatChart } from './components/StatChart';
import { DayFilter } from './components/DayFilter';
import { fetchPackageStats } from './api/npmApi';
import { CombinedData, DateRangeType } from './types';
import { usePersistence } from './hooks/usePersistence';

function App() {
    const { state, updateSync } = usePersistence();
    const { packages, range, customStart, customEnd, enabledDays, viewMode } = state;

    const [data, setData] = useState<CombinedData[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [partialErrors, setPartialErrors] = useState<string[]>([]);

    const handleSearch = useCallback(async (overrides?: { range?: DateRangeType, customStart?: string, customEnd?: string }) => {
        setIsLoading(true);
        setError(null);
        setPartialErrors([]);
        try {
            const activePkgs = packages.filter(p => p.name.trim() !== '');
            if (activePkgs.length === 0) {
                setData(null);
                setIsLoading(false);
                return;
            }

            const searchRange = overrides?.range || range;
            const searchStart = overrides?.customStart !== undefined ? overrides.customStart : customStart;
            const searchEnd = overrides?.customEnd !== undefined ? overrides.customEnd : customEnd;

            // Sync persistence
            updateSync({ range: searchRange, customStart: searchStart, customEnd: searchEnd, packages });

            const statsPromises = activePkgs.map(pkg => fetchPackageStats(pkg.name.trim(), searchRange, searchStart, searchEnd));
            const results = await Promise.all(statsPromises);

            const dayMap = new Map<string, { [pkgId: string]: number }>();
            const extractedErrors: string[] = [];

            results.forEach((res, index) => {
                const pkgId = activePkgs[index].id;
                if (res.error) extractedErrors.push(`[${res.package}] ${res.error}`);

                res.downloads.forEach(d => {
                    if (!dayMap.has(d.day)) dayMap.set(d.day, {});
                    dayMap.get(d.day)![pkgId] = d.downloads;
                });
            });

            const mergedData: CombinedData[] = Array.from(dayMap.entries()).map(([day, pkgsData]) => ({
                day,
                packages: pkgsData
            })).sort((a, b) => a.day.localeCompare(b.day));

            setData(mergedData);
            setPartialErrors(extractedErrors);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, [packages, range, customStart, customEnd, updateSync]);

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
                    setPackages={(pkgs) => updateSync({ packages: pkgs })}
                    range={range}
                    setRange={(r) => updateSync({ range: r })}
                    customStart={customStart}
                    setCustomStart={(s) => updateSync({ customStart: s })}
                    customEnd={customEnd}
                    setCustomEnd={(e) => updateSync({ customEnd: e })}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                />

                <DayFilter 
                    enabledDays={enabledDays}
                    setEnabledDays={(days) => updateSync({ enabledDays: days })}
                    viewMode={viewMode}
                    setViewMode={(mode) => updateSync({ viewMode: mode })}
                />

                {error && (
                    <div className="state-container">
                        <AlertCircle className="state-icon" style={{ color: 'var(--error-color)', opacity: 1 }} />
                        <div className="error-text">
                            <p style={{ color: 'inherit', fontWeight: 'bold' }}>Error fetching data</p>
                            <p style={{ color: 'inherit', marginTop: '0.25rem' }}>{error}</p>
                        </div>
                    </div>
                )}

                {partialErrors.length > 0 && !error && (
                    <div style={{ borderColor: 'var(--error-color)', background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', marginTop: '-1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error-color)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            <AlertCircle size={20} /> Some data could not be fetched
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {partialErrors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}

                {!error && data && data.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <StatChart data={data} packages={packages} visiblePackages={visiblePackages} groupBy="day" enabledDays={enabledDays} viewMode={viewMode} />
                        <StatChart data={data} packages={packages} visiblePackages={visiblePackages} groupBy="week" enabledDays={enabledDays} viewMode={viewMode} />
                        <StatChart data={data} packages={packages} visiblePackages={visiblePackages} groupBy="month" enabledDays={enabledDays} viewMode={viewMode} />
                        <StatChart data={data} packages={packages} visiblePackages={visiblePackages} groupBy="year" enabledDays={enabledDays} viewMode={viewMode} />
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
