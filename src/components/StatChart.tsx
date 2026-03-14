import { useMemo, useState, useRef, useEffect, FC, Fragment } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea,
    ReferenceLine
} from 'recharts';
import { parseISO, getDay } from 'date-fns';
import { CombinedData, GroupBy, PackageConfig, ViewMode } from '../types';
import { Activity } from 'lucide-react';
import { packageColors } from '../utils';
import { groupChartData } from '../chartUtils';

interface StatChartProps {
    data: CombinedData[];
    packages: PackageConfig[];
    visiblePackages: PackageConfig[];
    groupBy?: GroupBy;
    enabledDays: number[];
    viewMode: ViewMode;
}

export const StatChart: FC<StatChartProps> = ({ data, packages, visiblePackages, groupBy = "day", enabledDays, viewMode }) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        const filteredData = data.filter(item => enabledDays.includes(getDay(parseISO(item.day))));
        const grouped = groupChartData(filteredData, groupBy, packages);

        return grouped.map((item: any, index: number, self: any[]) => {
            const newItem = {
                ...item,
                pkgStats: {} as Record<string, { downloads: number, rateChangePercent: number }>
            };
            const prev = index > 0 ? self[index - 1] : null;

            packages.forEach(p => {
                const abs = item[p.id] || 0;
                let pct = 0;
                if (prev) {
                    const prevAbs = prev[p.id] || 0; // Use the raw absolute value from the grouped data
                    if (prevAbs === 0) {
                        pct = abs > 0 ? 100 : 0;
                    } else {
                        pct = ((abs - prevAbs) / prevAbs) * 100;
                    }
                }

                // Store both in a proper structure for metadata
                newItem.pkgStats[p.id] = { downloads: abs, rateChangePercent: pct };

                // Set the value used for charting/sorting
                newItem[p.id] = viewMode === 'percent' ? pct : abs;
            });
            return newItem;
        });
    }, [data, groupBy, packages, enabledDays, viewMode]);

    const packageSortValues = useMemo(() => {
        const values: { [id: string]: number } = {};
        packages.forEach(p => values[p.id] = 0);

        const count = chartData.length || 1;
        chartData.forEach(item => {
            packages.forEach(p => {
                const stats = item.pkgStats?.[p.id];
                if (viewMode === 'percent') {
                    values[p.id] += stats?.rateChangePercent || 0;
                } else {
                    values[p.id] += stats?.downloads || 0;
                }
            });
        });

        if (viewMode === 'percent') {
            packages.forEach(p => {
                values[p.id] = values[p.id] / count;
            });
        }
        return values;
    }, [chartData, packages, viewMode]);

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
                        {sortedPayload.map((entry: any, index: number) => {
                            const pkgId = entry.dataKey;
                            const stats = entry.payload.pkgStats?.[pkgId] || { downloads: 0, rateChangePercent: 0 };
                            const { downloads: abs, rateChangePercent: pct } = stats;
                            const pctColor = pct > 0 ? '#10b981' : pct < 0 ? '#ff5252' : '#94a3b8';
                            const pctSign = pct > 0 ? '+' : '';
                            const formattedPct = `${pctSign}${pct.toFixed(1)}%`;
                            const formattedAbs = formatNumber(abs);

                            const primaryValue = viewMode === 'percent' ? formattedPct : formattedAbs;
                            const secondaryValue = viewMode === 'percent' ? `(${formattedAbs})` : `(${formattedPct})`;

                            // Color primary value if in percent mode, else keep standard text color
                            const primaryColor = viewMode === 'percent' ? pctColor : '#f8fafc';
                            // Color secondary value if it's the percentage (in absolute mode)
                            const secondaryColor = viewMode === 'percent' ? '#94a3b8' : pctColor;

                            return (
                                <Fragment key={index}>
                                    <div className="tooltip-row-label">
                                        <span className="stat-label" style={{ color: entry.color }}>{entry.name}:</span>
                                    </div>
                                    <div className="tooltip-row-value">
                                        <span className="stat-value" style={{ color: primaryColor, fontWeight: 600 }}>{primaryValue}</span>
                                    </div>
                                    <div className="tooltip-row-value">
                                        <span className="stat-label" style={{ color: secondaryColor, fontSize: '0.75rem', fontWeight: 600 }}>
                                            {secondaryValue}
                                        </span>
                                    </div>
                                </Fragment>
                            );
                        })}
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
                                groupBy === 'month' ? 'Monthly' : 'Yearly'} {viewMode === 'percent' ? 'Change' : 'Downloads'}
                    </span>
                </div>
                <div className="chart-summary-group">
                    {[...visiblePackages].sort((a, b) => (packageSortValues[b.id] || 0) - (packageSortValues[a.id] || 0)).map((pkg) => {
                        const originalIndex = packages.findIndex(p => p.id === pkg.id);
                        const color = packageColors[originalIndex % packageColors.length];
                        const val = packageSortValues[pkg.id] || 0;
                        const summaryColor = viewMode === 'percent'
                            ? (val > 0 ? '#10b981' : val < 0 ? '#ef4444' : 'var(--text-secondary)')
                            : 'inherit';

                        return (
                            <div className="stat-summary" key={pkg.id}>
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

            <div className="chart-container" style={{ width: '100%', height: '400px', position: 'relative' }}>
                <div style={{ width: '100%', height: '400px', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} ref={chartContainerRef}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
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
                            <Tooltip content={<CustomTooltip />} />

                            {viewMode === 'percent' && (
                                <>
                                    <ReferenceArea y2={0} fill="rgba(239, 68, 68, 0.25)" isFront={false} />
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
