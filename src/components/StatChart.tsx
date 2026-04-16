/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { getDay, parseISO } from 'date-fns';
import { memo, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { If, Then } from 'react-if';

import { ChartType, chartTypeTraits } from '../chartType';
import { groupChartData } from '../chartUtils';
import { ChartDataPoint, CombinedData, GroupBy, PackageConfig } from '../types';
import { ViewMode, viewModeTraits } from '../viewMode';
import { ChartHeader } from './ChartHeader';
import { Placeholder } from './Placeholder';

interface StatChartProps {
    data: CombinedData[];
    packages: PackageConfig[];
    visiblePackages: PackageConfig[];
    groupBy?: GroupBy;
    enabledDays: number[];
    viewMode: ViewMode;
    chartType: ChartType;
}

const StatChart = memo(({
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
            const vals = relevantStats.map((s) => s[viewModeTraits[viewMode].metric]);
            const minThreshold = (viewMode === ViewMode.percent || viewMode === ViewMode.relative) ? 0.01 : 1;
            newItem.absMax = Math.max(...vals.map((v) => Math.abs(v)), minThreshold);
            newItem.displayMax = Math.max(...vals, minThreshold);
            newItem.displayMin = Math.min(...vals, 0);

            return newItem;
        });
    }, [data, groupBy, packages, visiblePackages, enabledDays, viewMode]);

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

    if (!chartData || chartData.length === 0 || visiblePackages.length === 0) {
        return <Placeholder loading={false} />;
    }

    const height = 400;

    const ChartView = chartTypeTraits[chartType].component;
    return (
        <div className="chart-section">
            <ChartHeader
                chartData={chartData}
                visiblePackages={visiblePackages}
                packages={packages}
                viewMode={viewMode}
                enabledDays={enabledDays}
                chartType={chartType}
                groupBy={groupBy}
            />

            <div className="chart-container" style={{ height }}>
                <div className="chart-inner" ref={chartContainerRef}>
                    <If condition={chartWidth > 0}>
                        <Then>
                            <Suspense fallback={<Placeholder loading={true} />}>
                                <ChartView
                                    chartData={chartData}
                                    visiblePackages={visiblePackages}
                                    packages={packages}
                                    viewMode={viewMode}
                                    chartWidth={chartWidth}
                                    height={height}
                                />
                            </Suspense>
                        </Then>
                    </If>
                </div>
            </div>
        </div>
    );
});

export default StatChart;
