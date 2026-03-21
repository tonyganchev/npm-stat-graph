/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { FC } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceArea,
    ReferenceLine
} from 'recharts';
import { PackageConfig, ViewMode } from '../types';
import { packageColors } from '../utils';
import { ChartTooltip } from './ChartTooltip';

interface BarChartViewProps {
    chartData: any[];
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
    height
}) => {
    return (
        <BarChart
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
                dataKey="shortDate"
                stroke="var(--text-secondary)"
                interval={0} // Process every tick to calculate boundaries accurately
                tickLine={false}
                tick={(props: any) => {
                    const { x, y, payload, index, width: propWidth } = props;
                    const axisWidth = propWidth || chartWidth || 0;
                    // Precise bandwidth calculation based on the tracked container width
                    const bandwidth = chartData.length > 0 ? axisWidth / chartData.length : 0;
                    
                    // Shift back to the boundary
                    const boundaryX = x - (bandwidth / 2);
                    
                    // Pull up to truly intersect the bar baseline (6px is the default Recharts tick size)
                    const adjustedY = y - 6;

                    const step = Math.max(1, Math.floor(chartData.length / 8));
                    const showLabel = index % step === 0;
                    const isLast = index === chartData.length - 1;

                    return (
                        <g transform={`translate(${boundaryX},${adjustedY})`}>
                            {/* Unified Baseline: perfectly connected to the bottom of the bars */}
                            {index === 0 && (
                                <line x1={0} x2={axisWidth} y1={0} y2={0} stroke="var(--text-secondary)" strokeWidth={1} />
                            )}

                            {/* Vertical Tick Mark: exactly touching the baseline */}
                            <line y1={0} y2={6} stroke="var(--text-secondary)" strokeWidth={1} />
                            
                            {showLabel && (
                                <text dy={20} textAnchor="middle" fill="var(--text-secondary)" fontSize={11}>
                                    {payload.value}
                                </text>
                            )}
                            
                            {/* Final boundary marker */}
                            {isLast && (
                                <line x1={bandwidth} x2={bandwidth} y1={0} y2={6} stroke="var(--text-secondary)" strokeWidth={1} />
                            )}
                        </g>
                    );
                }}
                axisLine={false} // Hidden in favor of our perfectly connected custom baseline above
                tickMargin={0}
                minTickGap={30}
            />
            <YAxis
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickFormatter={(value) => {
                    if (viewMode === 'percent') return `${value.toFixed(0)}%`;
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                    return value;
                }}
                width={60}
            />
            <Tooltip 
                content={
                    <ChartTooltip 
                        visiblePackages={visiblePackages} 
                        packages={packages} 
                        viewMode={viewMode} 
                    />
                }
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
            />

            {viewMode === 'percent' && (
                <>
                    <ReferenceArea y2={0} fill="rgba(239, 68, 68, 0.25)" isFront={false} />
                    <ReferenceLine y={0} stroke="rgba(239, 68, 68, 0.8)" strokeDasharray="3 3" />
                </>
            )}

            {/* Dummy bars to expand the coordinate system to include the full data range */}
            <Bar dataKey="displayMax" hide={true} isAnimationActive={false} />
            <Bar dataKey="displayMin" hide={true} isAnimationActive={false} />

            <Bar
                key={`bar-series-${visiblePackages.map(p => p.id).join(',')}-${viewMode}`}
                dataKey="absMax"
                fill="none"
                isAnimationActive={true}
                animationDuration={200}
                animationEasing="ease-in-out"
                shape={(props: any) => {
                    const { x, width, y: maxY, height: maxHeight, payload } = props;
                    if (!payload || !payload.pkgStats) return null as any;

                    const { pkgStats, absMax } = payload;
                    const y0 = maxY + maxHeight; // Base (zero-line)

                    return (
                        <g>
                            {visiblePackages.map((pkg) => {
                                const val = viewMode === 'percent'
                                    ? pkgStats[pkg.id]?.rateChangePercent || 0
                                    : pkgStats[pkg.id]?.downloads || 0;

                                const h = !absMax ? 0 : (Math.abs(val) / absMax) * maxHeight;
                                const y = val >= 0 ? y0 - h : y0;

                                const originalIndex = packages.findIndex(p => p.id === pkg.id);
                                const color = packageColors[originalIndex % packageColors.length];

                                return (
                                    <rect
                                        key={pkg.id}
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
