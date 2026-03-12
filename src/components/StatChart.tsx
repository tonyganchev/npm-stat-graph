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
import { format, parseISO, startOfWeek, startOfMonth, startOfYear, getDay } from 'date-fns';
import { CombinedData, GroupBy } from '../App';
import { Activity } from 'lucide-react';
import { PackageConfig, packageColors } from '../utils';

interface StatChartProps {
    data: CombinedData[];
    packages: PackageConfig[];
    visiblePackages: PackageConfig[];
    groupBy?: GroupBy;
    enabledDays: number[];
}

export const StatChart: React.FC<StatChartProps> = ({ data, packages, visiblePackages, groupBy = "day", enabledDays }) => {
    // Process and Group Data
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Simple filtering: Remove disabled days entirely (Vanishing Days approach)
        const filteredData = data.filter(item => enabledDays.includes(getDay(parseISO(item.day))));

        if (groupBy === 'day') {
            return filteredData.map(item => {
                const dateObj = parseISO(item.day);
                const dayItem: { day: string, formattedDate: string, shortDate: string, [pkgId: string]: any } = {
                    day: item.day,
                    formattedDate: format(dateObj, 'MMM d, yyyy'),
                    shortDate: format(dateObj, 'MMM d'),
                };
                packages.forEach(p => {
                    dayItem[p.id] = item.packages[p.id] || 0;
                });
                return dayItem;
            });
        }

        const groupedMap = new Map<string, { day: string, formattedDate: string, shortDate: string, [pkgId: string]: any }>();

        filteredData.forEach(item => {
            const dateObj = parseISO(item.day);
            let groupStart = dateObj;
            let fmt = 'MMM d, yyyy';
            let shortFmt = 'MMM d';

            if (groupBy === 'week') {
                groupStart = startOfWeek(dateObj);
                fmt = "'Week of' MMM d, yyyy";
            } else if (groupBy === 'month') {
                groupStart = startOfMonth(dateObj);
                fmt = "MMMM yyyy";
                shortFmt = "MMM yyyy";
            } else if (groupBy === 'year') {
                groupStart = startOfYear(dateObj);
                fmt = "yyyy";
                shortFmt = "yyyy";
            }

            const key = groupStart.toISOString();

            if (!groupedMap.has(key)) {
                groupedMap.set(key, {
                    day: key,
                    formattedDate: format(groupStart, fmt),
                    shortDate: format(groupStart, shortFmt)
                });
                packages.forEach(p => groupedMap.get(key)![p.id] = 0);
            }

            const current = groupedMap.get(key)!;
            packages.forEach(p => {
                if (item.packages[p.id]) {
                    current[p.id] += item.packages[p.id];
                }
            });
        });

        return Array.from(groupedMap.values()).sort((a, b) => a.day.localeCompare(b.day));
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
        // Plot width is approx total width minus left/right margins (20) and YAxis width (60)
        const plotWidth = chartWidth - 80;
        const distance = plotWidth / chartData.length;
        return distance >= 8;
    }, [chartWidth, chartData.length]);

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            // Sort payloads by value descending
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

    return (
        <div className="chart-section" style={{ height: '550px', minHeight: '550px' }}>
            <div className="chart-header">
                <div className="stat-summary" style={{ minWidth: '150px' }}>
                    <span className="stat-label">Grouped by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</span>
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

            {/* Need wrapper div to constrain responsive container explicitly */}
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
