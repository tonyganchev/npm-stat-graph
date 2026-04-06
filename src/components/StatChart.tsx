/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { getDay, parseISO } from 'date-fns';
import { Activity } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { groupChartData } from '../chartUtils';
import { ChartDataPoint, ChartType, CombinedData, GroupBy, PackageConfig, ViewMode } from '../types';
import {
    formatCompact,
    numberFormatBasicPercent,
    numberFormatChange,
    numberFormatChangePercent,
    numberFormatRatio,
    packageColors,
} from '../utils';
import { BarChartView } from './BarChartView';
import { LineChartView } from './LineChartView';

interface StatChartProps {
    data: CombinedData[];
    packages: PackageConfig[];
    visiblePackages: PackageConfig[];
    groupBy?: GroupBy;
    enabledDays: number[];
    viewMode: ViewMode;
    chartType: ChartType;
}

const statChart = memo(({
    data,
    packages,
    visiblePackages,
    groupBy = 'day',
    enabledDays,
    viewMode,
    chartType,
}: StatChartProps) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            return [];
        }
        const filteredData = data.filter((item) => enabledDays.includes(getDay(parseISO(item.day))));
        const grouped = groupChartData(filteredData, groupBy, packages);

        return grouped.map((item: ChartDataPoint, index: number, self: ChartDataPoint[]) => {
            const newItem = { ...item, pkgStats: { ...item.pkgStats } };
            const prev = index > 0 ? self[index - 1] : null;

            const firstVisiblePkg = visiblePackages[0];
            const firstAbs = firstVisiblePkg ? (item.pkgStats[firstVisiblePkg.name]?.downloads || 0) : 0;

            packages.forEach((p) => {
                const abs = item.pkgStats[p.name]?.downloads || 0;
                let pct = 0;
                let diff = 0;
                if (prev) {
                    const prevAbs = prev.pkgStats[p.name]?.downloads || 0;
                    diff = abs - prevAbs;
                    if (prevAbs === 0) {
                        pct = abs > 0 ? 1 : 0;
                    } else {
                        pct = (abs - prevAbs) / prevAbs;
                    }
                }

                newItem.pkgStats[p.name] = {
                    downloads: abs,
                    rateChangePercent: pct,
                    absoluteChange: diff,
                    relativeToFirst: firstAbs === 0 ? (abs > 0 ? 1 : 0) : abs / firstAbs,
                };
            });

            // Add max value for domain calculation
            const relevantStats = visiblePackages.map((p) => newItem.pkgStats[p.name]);
            let vals: number[];
            if (viewMode === ViewMode.percent) {
                vals = relevantStats.map((s) => s?.rateChangePercent || 0);
            } else if (viewMode === ViewMode.absoluteChange) {
                vals = relevantStats.map((s) => s?.absoluteChange || 0);
            } else if (viewMode === ViewMode.relative) {
                vals = relevantStats.map((s) => s?.relativeToFirst || 0);
            } else {
                vals = relevantStats.map((s) => s?.downloads || 0);
            }

            const minThreshold = (viewMode === ViewMode.percent || viewMode === ViewMode.relative) ? 0.01 : 1;
            newItem.absMax = Math.max(...vals.map((v) => Math.abs(v)), minThreshold);
            newItem.displayMax = Math.max(...vals, minThreshold);
            newItem.displayMin = Math.min(...vals, 0);

            return newItem;
        });
    }, [data, groupBy, packages, visiblePackages, enabledDays, viewMode]);

    const packageSortValues = useMemo(() => {
        const values: { [name: string]: number } = {};
        packages.forEach((p) => values[p.name] = 0);

        const count = chartData.length || 1;
        chartData.forEach((item) => {
            packages.forEach((p) => {
                const stats = item.pkgStats?.[p.name];
                if (viewMode === ViewMode.percent) {
                    values[p.name] += stats?.rateChangePercent || 0;
                } else if (viewMode === ViewMode.absoluteChange) {
                    values[p.name] += stats?.absoluteChange || 0;
                } else if (viewMode === ViewMode.relative) {
                    values[p.name] += stats?.relativeToFirst || 0;
                } else {
                    values[p.name] += stats?.downloads || 0;
                }
            });
        });

        if (viewMode === ViewMode.percent || viewMode === ViewMode.absoluteChange || viewMode === ViewMode.relative) {
            packages.forEach((p) => {
                values[p.name] = values[p.name] / count;
            });
        }
        return values;
    }, [chartData, packages, viewMode]);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState<number>(0);

    useEffect(() => {
        if (!chartContainerRef.current) {
            return;
        }
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                setChartWidth(entries[0].contentRect.width);
            }
        });
        observer.observe(chartContainerRef.current);
        return () => observer.disconnect();
    }, []);

    const showDots = useMemo(() => {
        if (!chartWidth || chartData.length <= 1) {
            return false;
        }
        const plotWidth = chartWidth - 80;
        const distance = plotWidth / chartData.length;
        return distance >= 4 || chartData.length < 200;
    }, [chartWidth, chartData.length]);

    // Removed local formatNumber in favor of formatCompact from utils.ts

    if (!chartData || chartData.length === 0 || visiblePackages.length === 0) {
        return (
            <div className="chart-section">
                <div className="state-container">
                    <Activity className="state-icon" />
                    <p>No active data available to display.</p>
                </div>
            </div>
        );
    }

    const groupByTitle = {
        day: 'Daily',
        week: 'Weekly',
        month: 'Monthly',
        year: 'Yearly',
    } as const;

    const viewModeTitle = {
        [ViewMode.absolute]: 'Downloads',
        [ViewMode.percent]: 'Change',
        [ViewMode.absoluteChange]: 'Net Change',
        [ViewMode.relative]: 'Relative Support',
    } as const;

    return (
        <div className="chart-section">
            <div className="chart-header">
                <div className="stat-summary stat-summary-main">
                    <span className="stat-label">
                        {groupByTitle[groupBy]}
                        &nbsp;
                        {viewModeTitle[viewMode]}
                    </span>
                </div>
                <div className="chart-summary-group">
                    {[...visiblePackages]
                        .sort((a, b) => (packageSortValues[b.name] || 0) - (packageSortValues[a.name] || 0))
                        .map((pkg, i) => {
                            const originalIndex = packages.findIndex((p) => p.name === pkg.name);
                            const pkgClass = `pkg-${originalIndex % packageColors.length}`;
                            const val = packageSortValues[pkg.name] || 0;
                            const isChange = viewMode === ViewMode.percent || viewMode === ViewMode.absoluteChange;
                            const isRelative = viewMode === ViewMode.relative;

                            let statusClass = '';
                            if (isRelative) {
                                statusClass = val > 1 ? 'undesirable-value' : val < 1 ? 'desirable-value' : '';
                            } else if (isChange) {
                                statusClass = val > 0
                                    ? 'desirable-value'
                                    : val < 0 ? 'undesirable-value' : 'baseline-value';
                            }

                            const formattedValue = isRelative
                                ? (val > 1
                                        ? `${numberFormatRatio.format(val)}x`
                                        : val === 1
                                            ? 'baseline'
                                            : numberFormatBasicPercent.format(val)) + ' avg'
                                : viewMode === ViewMode.percent
                                    ? `${numberFormatChangePercent.format(val)} avg`
                                    : viewMode === ViewMode.absoluteChange
                                        ? `${numberFormatChange.format(Math.round(val))} avg`
                                        : formatCompact(val);

                            return (
                                <div className="stat-summary" key={i}>
                                    <span className={`stat-label ${pkgClass}`}>{pkg.name}</span>
                                    <span className={`stat-value ${statusClass}`}>
                                        {formattedValue}
                                    </span>
                                </div>
                            );
                        })}
                </div>
            </div>

            <div className="chart-container">
                <div className="chart-inner" ref={chartContainerRef}>
                    {chartWidth > 0 && (
                        chartType === ChartType.line
                            ? (
                                    <LineChartView
                                        chartData={chartData}
                                        visiblePackages={visiblePackages}
                                        packages={packages}
                                        viewMode={viewMode}
                                        showDots={showDots}
                                        chartWidth={chartWidth}
                                        height={400}
                                    />
                                )
                            : (
                                    <BarChartView
                                        chartData={chartData}
                                        visiblePackages={visiblePackages}
                                        packages={packages}
                                        viewMode={viewMode}
                                        chartWidth={chartWidth}
                                        height={400}
                                    />
                                )
                    )}
                </div>
            </div>
        </div>
    );
});

export default statChart;
