import React, { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { DownloadStat } from '../api/npmApi';
import { Activity } from 'lucide-react';

interface StatChartProps {
    data: DownloadStat[];
    packageName: string;
}

export const StatChart: React.FC<StatChartProps> = ({ data, packageName }) => {
    const chartData = useMemo(() => {
        return data.map(item => ({
            ...item,
            // Create a nice formatted date for tooltips and axis
            formattedDate: format(parseISO(item.day), 'MMM d, yyyy'),
            shortDate: format(parseISO(item.day), 'MMM d')
        }));
    }, [data]);

    const totalDownloads = useMemo(() => {
        return data.reduce((sum, item) => sum + item.downloads, 0);
    }, [data]);

    if (!data || data.length === 0) {
        return (
            <div className="glass-panel chart-section">
                <div className="state-container">
                    <Activity className="state-icon" />
                    <p>No data available to display.</p>
                </div>
            </div>
        );
    }

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="custom-tooltip-label">{payload[0].payload.formattedDate}</p>
                    <p style={{ color: "var(--primary-color)", fontWeight: "bold", margin: 0 }}>
                        {formatNumber(payload[0].value)} downloads
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass-panel chart-section">
            <div className="chart-header">
                <div className="stat-summary">
                    <span className="stat-label">Total Downloads ({data.length} days)</span>
                    <span className="stat-value">{formatNumber(totalDownloads)}</span>
                </div>
                <div className="stat-summary" style={{ textAlign: 'right' }}>
                    <span className="stat-label">Package</span>
                    <span className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--accent-color)' }}>
                        {packageName}
                    </span>
                </div>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
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
                        <Area
                            type="monotone"
                            dataKey="downloads"
                            stroke="var(--primary-color)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorDownloads)"
                            activeDot={{ r: 6, fill: "var(--accent-color)", stroke: "var(--text-primary)", strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
