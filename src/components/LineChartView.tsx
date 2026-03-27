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
    YAxis,
} from 'recharts';

import { ChartDataPoint, PackageConfig, ViewMode } from '../types';
import { formatCompact, numberFormatChangePercent, packageColors } from '../utils';
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
    const packageKeys = useMemo(
        () => Object.fromEntries(visiblePackages.map((p) => [p.name, 'pkg_' + p.name.replace(/[^a-zA-Z0-9-]/g, '_')])),
        [visiblePackages]);

    const enrichedData = useMemo(() => chartData.map((d) => {
        const newObj: Record<string, unknown> = { ...d };
        visiblePackages.forEach((pkg) => {
            const stats = d.pkgStats[pkg.name];
            newObj[packageKeys[pkg.name]] = viewMode === ViewMode.percent
                ? stats?.rateChangePercent
                : viewMode === ViewMode.absoluteChange
                    ? stats?.absoluteChange
                    : stats?.downloads;
        });
        return newObj;
    }), [chartData, visiblePackages, viewMode, packageKeys]);

    const formatValue = (value: number) => {
        if (viewMode === ViewMode.percent) {
            return numberFormatChangePercent.format(value);
        }
        return formatCompact(value);
    };

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
                tickFormatter={formatValue}
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

            {(viewMode === ViewMode.percent || viewMode === ViewMode.absoluteChange) && (
                <>
                    <ReferenceArea y1={0} fill="rgba(239, 68, 68, 0.25)" />
                    <ReferenceLine y={0} stroke="rgba(239, 68, 68, 0.8)" strokeDasharray="3 3" />
                </>
            )}

            {visiblePackages.map((pkg) => {
                const originalIndex = packages.findIndex((p) => p.name === pkg.name);
                const color = packageColors[originalIndex % packageColors.length];

                const values = chartData.map((d) =>
                    viewMode === ViewMode.percent
                        ? d.pkgStats[pkg.name]?.rateChangePercent
                        : viewMode === ViewMode.absoluteChange
                            ? d.pkgStats[pkg.name]?.absoluteChange
                            : d.pkgStats[pkg.name]?.downloads,
                ).filter((v): v is number => typeof v === 'number');

                const minVal = values.length > 0 ? Math.min(...values) : null;
                const maxVal = values.length > 0 ? Math.max(...values) : null;

                return (
                    <g key={pkg.name}>
                        {minVal !== null && (
                            <ReferenceLine
                                y={minVal}
                                stroke={color}
                                strokeDasharray="5 2"
                            />
                        )}
                        {maxVal !== null && (
                            <ReferenceLine
                                y={maxVal}
                                stroke={color}
                                strokeDasharray="5 2"
                            />
                        )}
                        <Line
                            type="monotone"
                            dataKey={packageKeys[pkg.name]}
                            name={pkg.name}
                            stroke={color}
                            strokeWidth={1.5}
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                            dot={showDots ? { r: 3, fill: 'var(--card-bg)', stroke: color, strokeWidth: 1.5 } : false}
                            activeDot={{ r: 4, fill: color, stroke: 'var(--text-primary)', strokeWidth: 1.5 }}
                        />
                    </g>
                );
            })}
        </LineChart>
    );
};
