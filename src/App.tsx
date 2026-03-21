import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { SearchControls } from './components/SearchControls';
import { StatChart } from './components/StatChart';
import { DayFilter } from './components/DayFilter';
import { fetchPackageStats } from './api/npmApi';
import { CombinedData } from './types';
import { usePersistence } from './hooks/usePersistence';

function App() {
    const { state, updateSync } = usePersistence();
    const { packages, range, customStart, customEnd, enabledDays, viewMode, chartType } = state;

    const [data, setData] = useState<CombinedData[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [partialErrors, setPartialErrors] = useState<string[]>([]);

    const handleSearch = useCallback(async () => {
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

            const searchRange = range;
            const searchStart = customStart;
            const searchEnd = customEnd;

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
    }, [packages, range, customStart, customEnd]);

    // Initial load
    useEffect(() => {
        handleSearch();
    }, []);

    // Reactive search only for time range preset/date selection
    useEffect(() => {
        if (range !== 'custom' || (customStart && customEnd)) {
            handleSearch();
        }
    }, [range, customStart, customEnd]);


    // Filter out visible packages for charting
    const visiblePackages = packages.filter(p => p.visible && p.name.trim() !== '');

    return (
        <div className="app-container">
            <header>
                <h1>
                    <TrendingUp className="header-icon" size={40} />
                    npm-stat-graph
                </h1>
            </header>

            <main className="main-content">
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
                    chartType={chartType}
                    setChartType={(type) => updateSync({ chartType: type })}
                />

                {error && (
                    <div className="state-container">
                        <AlertCircle className="state-icon error" />
                        <div className="error-text">
                            <b>Error fetching data</b>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {partialErrors.length > 0 && !error && (
                    <div className="partial-error-container">
                        <div className="partial-error-header">
                            <AlertCircle size={20} /> Some data could not be fetched
                        </div>
                        <ul className="partial-error-list">
                            {partialErrors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}

                {!error && data && data.length > 0 && (
                    <div className="charts-stack">
                        <StatChart data={data} packages={packages} visiblePackages={visiblePackages} groupBy="day" enabledDays={enabledDays} viewMode={viewMode} chartType={chartType} />
                        <StatChart data={data} packages={packages} visiblePackages={visiblePackages} groupBy="week" enabledDays={enabledDays} viewMode={viewMode} chartType={chartType} />
                        <StatChart data={data} packages={packages} visiblePackages={visiblePackages} groupBy="month" enabledDays={enabledDays} viewMode={viewMode} chartType={chartType} />
                        <StatChart data={data} packages={packages} visiblePackages={visiblePackages} groupBy="year" enabledDays={enabledDays} viewMode={viewMode} chartType={chartType} />
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
