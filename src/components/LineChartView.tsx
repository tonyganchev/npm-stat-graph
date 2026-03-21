/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { FC } from 'react';
import {
    LineChart,
    Line,
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

interface LineChartViewProps {
    chartData: any[];
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
    height
}) => {
    return (
        <LineChart
            data={chartData}
            width={chartWidth}
            height={height}
            margin={{ top: 10, right: 10, left: 10, bottom: 50 }}
        >
            <CartesianGrid strokeDasharray="1 2" stroke="var(--text-secondary)" vertical={false} />
            <XAxis
                dataKey="shortDate"
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickMargin={10}
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
            />

            {viewMode === 'percent' && (
                <>
                    <ReferenceArea y1={0} fill="rgba(239, 68, 68, 0.25)" isFront={false} />
                    <ReferenceLine y={0} stroke="rgba(239, 68, 68, 0.8)" strokeDasharray="3 3" />
                </>
            )}

            {visiblePackages.map((pkg) => {
                const originalIndex = packages.findIndex(p => p.id === pkg.id);
                const color = packageColors[originalIndex % packageColors.length];
                return (
                    <Line
                        key={pkg.id}
                        type="monotone"
                        dataKey={pkg.id}
                        name={pkg.name}
                        stroke={color}
                        strokeWidth={1.5}
                        animationDuration={1500}
                        animationEasing="ease-in-out"
                        dot={showDots ? { r: 3, fill: "var(--card-bg)", stroke: color, strokeWidth: 1.5 } : false}
                        activeDot={{ r: 4, fill: color, stroke: "var(--text-primary)", strokeWidth: 1.5 }}
                    />
                )
            })}
        </LineChart>
    );
};
