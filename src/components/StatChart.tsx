/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { getDay,parseISO } from 'date-fns';
import { Activity } from 'lucide-react';
import { memo,useEffect, useMemo, useRef, useState } from 'react';

import { groupChartData } from '../chartUtils';
import { ChartDataPoint,ChartType, CombinedData, GroupBy, PackageConfig, ViewMode } from '../types';
import { packageColors } from '../utils';
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
    groupBy = "day", 
    enabledDays, 
    viewMode, 
    chartType 
}: StatChartProps) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            return [];
        }
        const filteredData = data.filter(item => enabledDays.includes(getDay(parseISO(item.day))));
        const grouped = groupChartData(filteredData, groupBy, packages);

        return grouped.map((item: ChartDataPoint, index: number, self: ChartDataPoint[]) => {
            const newItem = { ...item, pkgStats: { ...item.pkgStats } };
            const prev = index > 0 ? self[index - 1] : null;

            packages.forEach(p => {
                const abs = item.pkgStats[p.name]?.downloads || 0;
                let pct = 0;
                if (prev) {
                    const prevAbs = prev.pkgStats[p.name]?.downloads || 0;
                    if (prevAbs === 0) {
                        pct = abs > 0 ? 100 : 0;
                    } else {
                        pct = ((abs - prevAbs) / prevAbs) * 100;
                    }
                }

                newItem.pkgStats[p.name] = { downloads: abs, rateChangePercent: pct };
            });

            // Add max value for domain calculation
            const relevantStats = visiblePackages.map(p => newItem.pkgStats[p.name]);
            const vals = viewMode === 'percent' 
                ? relevantStats.map(s => s?.rateChangePercent || 0) 
                : relevantStats.map(s => s?.downloads || 0);
            
            newItem.absMax = Math.max(...vals.map(v => Math.abs(v)), 1);
            newItem.displayMax = Math.max(...vals, 1);
            newItem.displayMin = Math.min(...vals, 0);

            return newItem;
        });
    }, [data, groupBy, packages, visiblePackages, enabledDays, viewMode]);

    const packageSortValues = useMemo(() => {
        const values: { [name: string]: number } = {};
        packages.forEach(p => values[p.name] = 0);

        const count = chartData.length || 1;
        chartData.forEach(item => {
            packages.forEach(p => {
                const stats = item.pkgStats?.[p.name];
                if (viewMode === 'percent') {
                    values[p.name] += stats?.rateChangePercent || 0;
                } else {
                    values[p.name] += stats?.downloads || 0;
                }
            });
        });

        if (viewMode === 'percent') {
            packages.forEach(p => {
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

    const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

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

    return (
        <div className="chart-section">
            <div className="chart-header">
                <div className="stat-summary stat-summary-main">
                    <span className="stat-label">
                        {groupBy === 'day' ? 'Daily' :
                            groupBy === 'week' ? 'Weekly' :
                                groupBy === 'month' ? 'Monthly' : 'Yearly'} {viewMode === 'percent' ? 'Change' : 'Downloads'}
                    </span>
                </div>
                <div className="chart-summary-group">
                    {[...visiblePackages].sort((a, b) => (packageSortValues[b.name] || 0) - (packageSortValues[a.name] || 0)).map((pkg, i) => {
                        const originalIndex = packages.findIndex(p => p.name === pkg.name);
                        const color = packageColors[originalIndex % packageColors.length];
                        const val = packageSortValues[pkg.name] || 0;
                        const summaryColor = viewMode === 'percent'
                            ? (val > 0 ? '#10b981' : val < 0 ? '#ef4444' : 'var(--text-secondary)')
                            : 'inherit';

                        return (
                            <div className="stat-summary" key={i}>
                                <span className="stat-label" style={{ color }}>{pkg.name}</span>
                                <span className="stat-value" style={{ color: summaryColor }}>
                                    {viewMode === 'percent'
                                        ? `${val > 0 ? '+' : ''}${val.toFixed(1)}% avg`
                                        : formatNumber(val)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="chart-container">
                <div className="chart-inner" ref={chartContainerRef}>
                    {chartWidth > 0 && (
                        chartType === 'line' ? (
                            <LineChartView
                                chartData={chartData}
                                visiblePackages={visiblePackages}
                                packages={packages}
                                viewMode={viewMode}
                                showDots={showDots}
                                chartWidth={chartWidth}
                                height={400}
                            />
                        ) : (
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
