/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { FC, useMemo } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceArea,
    ReferenceLine,
    Tooltip,
    XAxis,
    YAxis } from 'recharts';

import { ChartDataPoint, PackageConfig, ViewMode } from '../types';
import { packageColors } from '../utils';
import { ChartTooltip } from './ChartTooltip';

interface LineChartViewProps {
    chartData: ChartDataPoint[];
    visiblePackages: PackageConfig[];
    packages: PackageConfig[];
    viewMode: ViewMode;
    showDots: boolean;
    chartWidth: number;
    height: number;
}

export const LineChartView: FC<LineChartViewProps> = ({
    chartData,
    visiblePackages,
    packages,
    viewMode,
    showDots,
    chartWidth,
    height,
}) => {
    const enrichedData = useMemo(() => {
        return chartData.map((d) => {
            const newObj: Record<string, unknown> = { ...d };
            visiblePackages.forEach((pkg) => {
                const safeName = pkg.name.replace(/[^a-zA-Z0-9-]/g, '_');
                newObj[`val_${safeName}`] = viewMode === ViewMode.percent
                    ? d.pkgStats[pkg.name]?.rateChangePercent
                    : d.pkgStats[pkg.name]?.downloads;
            });
            return newObj;
        });
    }, [chartData, visiblePackages, viewMode]);

    return (
        <LineChart
            key={`${viewMode}-${chartData.length}`}
            data={enrichedData}
            width={chartWidth}
            height={height}
            margin={{ top: 10, right: 10, left: 10, bottom: 50 }}
        >
            <CartesianGrid strokeDasharray="1 2" stroke="var(--text-secondary)" vertical={false} />
            <XAxis
                dataKey="day"
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickFormatter={(value) => chartData.find((d) => d.day === value)?.shortDate || value}
                tickMargin={10}
                minTickGap={30}
            />
            <YAxis
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickFormatter={(value) => {
                    if (viewMode === ViewMode.percent) return `${value.toFixed(0)}%`;
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                    return value;
                }}
                width={60}
            />
            <Tooltip
                content={(
                    <ChartTooltip
                        visiblePackages={visiblePackages}
                        packages={packages}
                        viewMode={viewMode}
                    />
                )}
            />

            {viewMode === ViewMode.percent && (
                <>
                    <ReferenceArea y1={0} fill="rgba(239, 68, 68, 0.25)" />
                    <ReferenceLine y={0} stroke="rgba(239, 68, 68, 0.8)" strokeDasharray="3 3" />
                </>
            )}

            {visiblePackages.map((pkg) => {
                const originalIndex = packages.findIndex((p) => p.name === pkg.name);
                const color = packageColors[originalIndex % packageColors.length];
                return (
                    <Line
                        key={pkg.name}
                        type="monotone"
                        dataKey={`val_${pkg.name.replace(/[^a-zA-Z0-9-]/g, '_')}`}
                        name={pkg.name}
                        stroke={color}
                        strokeWidth={1.5}
                        animationDuration={1500}
                        animationEasing="ease-in-out"
                        dot={showDots ? { r: 3, fill: 'var(--card-bg)', stroke: color, strokeWidth: 1.5 } : false}
                        activeDot={{ r: 4, fill: color, stroke: 'var(--text-primary)', strokeWidth: 1.5 }}
                    />
                );
            })}
        </LineChart>
    );
};
