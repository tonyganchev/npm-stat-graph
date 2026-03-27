/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { FC } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ReferenceArea,
    ReferenceLine,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { ChartDataPoint, PackageConfig, PeriodMetrics, ViewMode } from '../types';
import { packageColors } from '../utils';
import { ChartTooltip } from './ChartTooltip';

interface BarChartViewProps {
    chartData: ChartDataPoint[];
    visiblePackages: PackageConfig[];
    packages: PackageConfig[];
    viewMode: ViewMode;
    chartWidth: number;
    height: number;
}

export const BarChartView: FC<BarChartViewProps> = ({
    chartData,
    visiblePackages,
    packages,
    viewMode,
    chartWidth,
    height,
}) => {
    const globalMin = Math.min(...chartData.map((d) => typeof d.displayMin === 'number' ? d.displayMin : 0), 0);
    const globalMax = Math.max(...chartData.map((d) => typeof d.displayMax === 'number' ? d.displayMax : 0), 1);

    return (
        <BarChart
            key={`${viewMode}-${chartData.length}`}
            data={chartData}
            width={chartWidth}
            height={height}
            barCategoryGap="5%"
            margin={{ top: 10, right: 30, left: 40, bottom: 50 }}
        >
            <CartesianGrid
                strokeDasharray="1 2"
                stroke="var(--text-secondary)"
                vertical={false}
            />
            <XAxis
                dataKey="day"
                stroke="var(--text-secondary)"
                interval={0} // Process every tick to calculate boundaries accurately
                tickLine={false}
                tick={(props: {
                    x?: string | number;
                    y?: string | number;
                    payload?: { value?: string | number };
                    index?: number;
                    width?: string | number;
                }) => {
                    const { x: propX = 0, y: propY = 0, index = 0, width: propWidth = 0 } = props;
                    const x = Number(propX);
                    const y = Number(propY);
                    const axisWidth = Number(propWidth) || chartWidth || 0;
                    // Precise bandwidth calculation based on the tracked
                    // container width
                    const bandwidth = chartData.length > 0 ? axisWidth / chartData.length : 0;

                    // Shift back to the boundary
                    const boundaryX = x - (bandwidth / 2);

                    // Pull up to truly intersect the bar baseline (6px is the
                    // default Recharts tick size)
                    const adjustedY = y - 6;

                    const step = Math.max(1, Math.floor(chartData.length / 8));
                    const showLabel = index % step === 0;
                    const isLast = index === chartData.length - 1;

                    return (
                        <g transform={`translate(${boundaryX},${adjustedY})`}>
                            {/* Unified Baseline: perfectly connected to the
                                bottom of the bars */}
                            {index === 0 && (
                                <line
                                    x1={0}
                                    x2={axisWidth}
                                    y1={0}
                                    y2={0}
                                    stroke="var(--text-secondary)"
                                    strokeWidth={1}
                                />
                            )}

                            {/* Vertical Tick Mark: exactly touching the
                                baseline */}
                            <line
                                y1={0}
                                y2={6}
                                stroke="var(--text-secondary)"
                                strokeWidth={1}
                            />

                            {showLabel && (
                                <text
                                    dy={20}
                                    textAnchor="middle"
                                    fill="var(--text-secondary)"
                                    fontSize={11}
                                >
                                    {chartData[index]?.shortDate}
                                </text>
                            )}

                            {/* Final boundary marker */}
                            {isLast && (
                                <line
                                    x1={bandwidth}
                                    x2={bandwidth}
                                    y1={0}
                                    y2={6}
                                    stroke="var(--text-secondary)"
                                    strokeWidth={1}
                                />
                            )}
                        </g>
                    );
                }}
                axisLine={false} // Hidden in favor of our perfectly connected custom baseline above
                tickMargin={0}
                minTickGap={30}
            />
            <YAxis
                domain={[
                    (dataMin: number) => Math.min(dataMin, globalMin),
                    (dataMax: number) => Math.max(dataMax, globalMax),
                ]}
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickFormatter={(value) => {
                    if (viewMode === ViewMode.percent) return `${value.toFixed(0)}%`;
                    const abs = Math.abs(value);
                    if (abs >= 1000000) {
                        return `${(value / 1000000).toFixed(1)}M`;
                    }
                    if (abs >= 1000) {
                        return `${(value / 1000).toFixed(0)}k`;
                    }
                    return value.toFixed(0);
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
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
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

                const metricToUse: Record<ViewMode, keyof PeriodMetrics> = {
                    [ViewMode.absolute]: 'downloads',
                    [ViewMode.absoluteChange]: 'absoluteChange',
                    [ViewMode.percent]: 'rateChangePercent',
                };
                const values = chartData
                    .map((d) => d.pkgStats[pkg.name]?.[metricToUse[viewMode]])
                    .filter((v): v is number => typeof v === 'number');

                const minVal = values.length > 0 ? Math.min(...values) : null;
                const maxVal = values.length > 0 ? Math.max(...values) : null;

                return (
                    <g key={`ref-lines-${pkg.name}`}>
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
                    </g>
                );
            })}

            <Bar
                key={`bar-series-${visiblePackages.map((p) => p.name).join(',')}-${viewMode}`}
                dataKey="absMax"
                fill="none"
                isAnimationActive={true}
                animationDuration={200}
                animationEasing="ease-in-out"
                shape={(props: {
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    payload?: {
                        pkgStats?: Record<string, {
                            downloads: number;
                            rateChangePercent: number;
                            absoluteChange: number;
                        }>;
                        absMax?: number;
                    };
                }) => {
                    const { x = 0, width = 0, y: maxY = 0, height: maxHeight = 0, payload } = props;
                    if (!payload || !payload.pkgStats) {
                        return <g></g>;
                    }

                    const { pkgStats, absMax } = payload;
                    const y0 = maxY + maxHeight; // Base (zero-line)

                    return (
                        <g>
                            {visiblePackages.map((pkg) => {
                                const stats = pkgStats[pkg.name];
                                const val = viewMode === ViewMode.percent
                                    ? stats?.rateChangePercent || 0
                                    : viewMode === ViewMode.absoluteChange
                                        ? stats?.absoluteChange || 0
                                        : stats?.downloads || 0;

                                const h = !absMax ? 0 : (Math.abs(val) / absMax) * maxHeight;
                                const y = val >= 0 ? y0 - h : y0;

                                const originalIndex = packages.findIndex((p) => p.name === pkg.name);
                                const color = packageColors[originalIndex % packageColors.length];

                                return (
                                    <rect
                                        key={pkg.name}
                                        x={x}
                                        y={y}
                                        width={width}
                                        height={h}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth={1.5}
                                        rx={2}
                                        ry={2}
                                    />
                                );
                            })}
                        </g>
                    );
                }}
            />
        </BarChart>
    );
};
