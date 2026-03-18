import { useMemo, useState, useRef, useEffect, FC, Fragment } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea,
    ReferenceLine
} from 'recharts';
import { parseISO, getDay } from 'date-fns';
import { CombinedData, GroupBy, PackageConfig, ViewMode, ChartType } from '../types';
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
    chartType: ChartType;
}

export const StatChart: FC<StatChartProps> = ({ data, packages, visiblePackages, groupBy = "day", enabledDays, viewMode, chartType }) => {
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
                    const prevAbs = prev[p.id] || 0;
                    if (prevAbs === 0) {
                        pct = abs > 0 ? 100 : 0;
                    } else {
                        pct = ((abs - prevAbs) / prevAbs) * 100;
                    }
                }

                newItem.pkgStats[p.id] = { downloads: abs, rateChangePercent: pct };
                newItem[p.id] = viewMode === 'percent' ? pct : abs;
            });

            // Add max value for domain calculation
            const statsArray = Object.values(newItem.pkgStats) as { downloads: number, rateChangePercent: number }[];
            if (viewMode === 'percent') {
                newItem.maxVal = Math.max(...statsArray.map(s => s.rateChangePercent), 0);
            } else {
                newItem.maxVal = Math.max(...statsArray.map(s => s.downloads), 0);
            }

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
            const dataPoint = payload[0].payload;
            const isBarChart = payload.some((p: any) => p.dataKey === 'maxVal');
            
            let displayItems = [];
            if (isBarChart && dataPoint.pkgStats) {
                displayItems = visiblePackages.map(pkg => {
                    const stats = dataPoint.pkgStats[pkg.id] || { downloads: 0, rateChangePercent: 0 };
                    const value = viewMode === 'percent' ? stats.rateChangePercent : stats.downloads;
                    return {
                        dataKey: pkg.id,
                        name: pkg.name,
                        value,
                        payload: dataPoint,
                        color: packageColors[packages.findIndex(p => p.id === pkg.id) % packageColors.length]
                    };
                });
            } else {
                displayItems = payload.map((p: any) => ({
                    ...p,
                    color: p.stroke || p.color || p.fill
                }));
            }

            const sortedItems = [...displayItems].sort((a, b) => (b.value || 0) - (a.value || 0));

            return (
                <div className="custom-tooltip">
                    <p className="stat-label custom-tooltip-label">{dataPoint.formattedDate}</p>
                    <div className="tooltip-grid">
                        {sortedItems.map((entry: any, index: number) => {
                            const pkgId = entry.dataKey;
                            const stats = entry.payload.pkgStats?.[pkgId] || { downloads: 0, rateChangePercent: 0 };
                            const { downloads: abs, rateChangePercent: pct } = stats;
                            const pctColor = pct > 0 ? '#10b981' : pct < 0 ? '#ff5252' : '#94a3b8';
                            const pctSign = pct > 0 ? '+' : '';
                            const formattedPct = `${pctSign}${pct.toFixed(1)}%`;
                            const formattedAbs = formatNumber(abs);

                            const primaryValue = viewMode === 'percent' ? formattedPct : formattedAbs;
                            const secondaryValue = viewMode === 'percent' ? `(${formattedAbs})` : `(${formattedPct})`;

                            const primaryColor = viewMode === 'percent' ? pctColor : '#f8fafc';
                            const secondaryColor = viewMode === 'percent' ? '#94a3b8' : pctColor;

                            return (
                                <Fragment key={pkgId || index}>
                                    <div className="tooltip-row-label">
                                        <span className="stat-label" style={{ color: entry.color }}>{entry.name}:</span>
                                    </div>
                                    <div className="tooltip-row-value">
                                        <span className="stat-value" style={{ color: primaryColor }}>{primaryValue}</span>
                                    </div>
                                    <div className="tooltip-row-value">
                                        <span className="stat-label secondary-value" style={{ color: secondaryColor }}>
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

            <div className="chart-container">
                <div className="chart-inner" ref={chartContainerRef}>
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'line' ? (
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
                        ) : (
                            <BarChart
                                data={chartData}
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
                                        const { x, y, payload, index, width: axisWidth } = props;
                                        // Use the exact width of the axis provided by Recharts
                                        const bandwidth = chartData.length > 0 ? axisWidth / chartData.length : 0;

                                        // Shift back to the boundary
                                        const boundaryX = x - (bandwidth / 2);

                                        // Pull up to truly intersect the bar baseline (reversing Recharts' internal padding)
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
                                    content={<CustomTooltip />}
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                />

                                {viewMode === 'percent' && (
                                    <>
                                        <ReferenceArea y2={0} fill="rgba(239, 68, 68, 0.25)" isFront={false} />
                                        <ReferenceLine y={0} stroke="rgba(239, 68, 68, 0.8)" strokeDasharray="3 3" />
                                    </>
                                )}

                                {/* Final boundary tick is now handled by the custom tick component's isLast check */}

                                {/* Outline style bars that overlap perfectly.
                                    This ensures all plugins are visible even if they have 
                                    identical or overlapping values. */}
                                <Bar
                                    dataKey="maxVal"
                                    fill="none"
                                    isAnimationActive={false}
                                    shape={(props: any) => {
                                        const { x, width, y: maxY, height: maxHeight, payload } = props;
                                        if (!payload || !payload.pkgStats) return null as any;

                                        const { pkgStats, maxVal } = payload;
                                        const y0 = maxY + maxHeight; // Base (zero-line)

                                        return (
                                            <g>
                                                {visiblePackages.map((pkg) => {
                                                    const val = viewMode === 'percent'
                                                        ? pkgStats[pkg.id]?.rateChangePercent || 0
                                                        : pkgStats[pkg.id]?.downloads || 0;

                                                    // Ratio = val / maxVal. Height = ratio * maxHeight.
                                                    const h = !maxVal ? 0 : (Math.abs(val) / maxVal) * maxHeight;
                                                    const y = y0 - h;

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
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
