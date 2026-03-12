import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { parseISO, getDay } from 'date-fns';
import { CombinedData, GroupBy, PackageConfig } from '../types';
import { Activity } from 'lucide-react';
import { packageColors } from '../utils';
import { groupChartData } from '../chartUtils';

interface StatChartProps {
    data: CombinedData[];
    packages: PackageConfig[];
    visiblePackages: PackageConfig[];
    groupBy?: GroupBy;
    enabledDays: number[];
}

export const StatChart: React.FC<StatChartProps> = ({ data, packages, visiblePackages, groupBy = "day", enabledDays }) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        const filteredData = data.filter(item => enabledDays.includes(getDay(parseISO(item.day))));
        return groupChartData(filteredData, groupBy, packages);
    }, [data, groupBy, packages, enabledDays]);

    const packageTotals = useMemo(() => {
        const totals: { [id: string]: number } = {};
        packages.forEach(p => totals[p.id] = 0);
        chartData.forEach(item => {
            packages.forEach(p => {
                totals[p.id] += item[p.id] || 0;
            });
        });
        return totals;
    }, [chartData, packages]);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState<number>(0);

    useEffect(() => {
        if (!chartContainerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                setChartWidth(entries[0].contentRect.width);
            }
        });
        observer.observe(chartContainerRef.current);
        return () => observer.disconnect();
    }, []);

    const showDots = useMemo(() => {
        if (!chartWidth || chartData.length <= 1) return true;
        const plotWidth = chartWidth - 80;
        const distance = plotWidth / chartData.length;
        return distance >= 8;
    }, [chartWidth, chartData.length]);

    const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
            return (
                <div className="custom-tooltip">
                    <p className="stat-label custom-tooltip-label">{payload[0].payload.formattedDate}</p>
                    <div className="tooltip-grid">
                        {sortedPayload.map((entry: any, index: number) => (
                            <React.Fragment key={index}>
                                <div className="tooltip-row-label">
                                    <span className="stat-label" style={{ color: entry.color }}>{entry.name}:</span>
                                </div>
                                <div className="tooltip-row-value">
                                    <span className="stat-value">{formatNumber(entry.value)}</span>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

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
        <div className="chart-section" style={{ height: '550px', minHeight: '550px' }}>
            <div className="chart-header">
                <div className="stat-summary" style={{ minWidth: '150px' }}>
                    <span className="stat-label">
                        {groupBy === 'day' ? 'Daily' : 
                         groupBy === 'week' ? 'Weekly' : 
                         groupBy === 'month' ? 'Monthly' : 'Yearly'} Downloads
                    </span>
                </div>
                <div className="chart-summary-group">
                    {[...visiblePackages].sort((a, b) => (packageTotals[b.id] || 0) - (packageTotals[a.id] || 0)).map((pkg) => {
                        const originalIndex = packages.findIndex(p => p.id === pkg.id);
                        const color = packageColors[originalIndex % packageColors.length];
                        return (
                            <div className="stat-summary" key={pkg.id}>
                                <span className="stat-label" style={{ color }}>{pkg.name}</span>
                                <span className="stat-value">{formatNumber(packageTotals[pkg.id])}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="chart-container" style={{ width: '100%', height: '400px', position: 'relative' }}>
                <div style={{ width: '100%', height: '400px', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} ref={chartContainerRef}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
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
                                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                                    return value;
                                }}
                                width={60}
                            />
                            <Tooltip content={<CustomTooltip />} />

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
                                        dot={showDots ? { r: 3, fill: "var(--card-bg)", stroke: color, strokeWidth: 1.5 } : false}
                                        activeDot={{ r: 4, fill: color, stroke: "var(--text-primary)", strokeWidth: 1.5 }}
                                    />
                                )
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
