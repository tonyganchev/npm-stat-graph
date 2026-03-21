import { Fragment, FC } from 'react';
import { PackageConfig, ViewMode } from '../types';
import { packageColors } from '../utils';

interface ChartTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    visiblePackages: PackageConfig[];
    packages: PackageConfig[];
    viewMode: ViewMode;
}

const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

export const ChartTooltip: FC<ChartTooltipProps> = ({ active, payload, visiblePackages, packages, viewMode }) => {
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
