/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { Activity, AlertCircle, ExternalLink } from 'lucide-react';
import { lazy, Suspense, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';

import { fetchPackageStats } from './api/npmApi';
import { ChartTypeToggle } from './components/ChartTypeToggle';
import { DayFilter } from './components/DayFilter';
import { GitHubIcon } from './components/GitHubIcon';
import { SearchControls } from './components/SearchControls';
import { ViewModeToggle } from './components/ViewModeToggle';
import { usePersistence } from './hooks/usePersistence';
import { CombinedData } from './types';

const StatChart = lazy(() => import('./components/StatChart'));

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
            const activePkgs = packages.filter((p) => p.name.trim() !== '');
            if (activePkgs.length === 0) {
                setData(null);
                setIsLoading(false);
                return;
            }

            const searchRange = range;
            const searchStart = customStart;
            const searchEnd = customEnd;

            const statsPromises =
                activePkgs.map((pkg) => fetchPackageStats(pkg.name.trim(), searchRange, searchStart, searchEnd));
            const results = await Promise.all(statsPromises);

            const dayMap = new Map<string, { [pkgName: string]: number }>();
            const extractedErrors: string[] = [];

            results.forEach((res, index) => {
                const pkgName = activePkgs[index].name.trim();
                if (res.error) extractedErrors.push(`[${res.package}] ${res.error}`);

                res.downloads.forEach((d) => {
                    if (!dayMap.has(d.day)) {
                        dayMap.set(d.day, {});
                    }
                    dayMap.get(d.day)![pkgName] = d.downloads;
                });
            });

            const mergedData: CombinedData[] = Array.from(dayMap.entries()).map(([day, pkgsData]) => ({
                day,
                packages: pkgsData,
            })).sort((a, b) => a.day.localeCompare(b.day));

            setData(mergedData);
            setPartialErrors(extractedErrors);
        } catch (err) {
            setError((err as Error).message || 'Failed to fetch data');
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, [packages, range, customStart, customEnd]);

    // Trigger search on mount and when parameters change, with a 500ms debounce
    // while typing
    useEffect(() => {
        const timer = setTimeout(() => {
            if (range !== 'custom' || (customStart && customEnd)) {
                handleSearch();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [handleSearch, range, customStart, customEnd]);

    // Filter out visible packages for charting
    const visiblePackages = useMemo(() => packages.filter((p) => p.visible && p.name.trim() !== ''), [packages]);

    // Use deferred values for charting to keep the autocomplete input snappy
    const deferredPackages = useDeferredValue(packages);
    const deferredVisiblePackages = useDeferredValue(visiblePackages);

    return (
        <>
            <header>
                <h1>
                    <img
                        src={`${import.meta.env.BASE_URL}favicon.svg`}
                        alt="Logo"
                        width={40}
                        height={40}
                    />
                    npm-stat-graph
                </h1>
            </header>

            <main>
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

                <div className="filter-panel">
                    <DayFilter
                        enabledDays={enabledDays}
                        setEnabledDays={(days) => updateSync({ enabledDays: days })}
                    />

                    <ViewModeToggle
                        viewMode={viewMode}
                        setViewMode={(mode) => updateSync({ viewMode: mode })}
                    />

                    <ChartTypeToggle
                        chartType={chartType}
                        setChartType={(type) => updateSync({ chartType: type })}
                    />
                </div>

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
                            <AlertCircle size={20} />
                            {' '}
                            Some data could not be fetched
                        </div>
                        <ul className="partial-error-list">
                            {partialErrors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}

                {!error && data && data.length > 0 && (
                    <div className="charts-stack">
                        <Suspense fallback={(
                            <div className="chart-section">
                                <div className="state-container">
                                    <Activity className="state-icon spinning" />
                                    <p>Loading charts...</p>
                                </div>
                            </div>
                        )}
                        >
                            <StatChart
                                data={data}
                                packages={deferredPackages}
                                visiblePackages={deferredVisiblePackages}
                                groupBy="day"
                                enabledDays={enabledDays}
                                viewMode={viewMode}
                                chartType={chartType}
                            />
                            <StatChart
                                data={data}
                                packages={deferredPackages}
                                visiblePackages={deferredVisiblePackages}
                                groupBy="week"
                                enabledDays={enabledDays}
                                viewMode={viewMode}
                                chartType={chartType}
                            />
                            <StatChart
                                data={data}
                                packages={deferredPackages}
                                visiblePackages={deferredVisiblePackages}
                                groupBy="month"
                                enabledDays={enabledDays}
                                viewMode={viewMode}
                                chartType={chartType}
                            />
                            <StatChart
                                data={data}
                                packages={deferredPackages}
                                visiblePackages={deferredVisiblePackages}
                                groupBy="year"
                                enabledDays={enabledDays}
                                viewMode={viewMode}
                                chartType={chartType}
                            />
                        </Suspense>
                    </div>
                )}
            </main>
            <footer>
                <div>
                    <p>
                        &copy; 2026 Tony Ganchev. Licensed under the MIT License.
                        <a
                            href="https://github.com/tonyganchev/npm-stat-graph"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="GitHub Repository"
                        >
                            <GitHubIcon />
                            GitHub project
                            <ExternalLink size={16} />
                        </a>
                    </p>
                </div>
            </footer>
        </>
    );
}

export default App;
