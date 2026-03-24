/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { FC,Fragment } from 'react';

import { ChartDataPoint,PackageConfig, ViewMode } from '../types';
import { packageColors } from '../utils';

interface TooltipPayloadItem {
    dataKey?: string | number;
    name?: string;
    value?: number;
    payload: ChartDataPoint;
    color?: string;
    stroke?: string;
    fill?: string;
}

interface ChartTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
    visiblePackages: PackageConfig[];
    packages: PackageConfig[];
    viewMode: ViewMode;
}

const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

export const ChartTooltip: FC<ChartTooltipProps> = ({ active, payload, visiblePackages, packages, viewMode }) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        const isBarChart = payload.some((p: TooltipPayloadItem) => p.dataKey === 'absMax');
        
        let displayItems: TooltipPayloadItem[] = [];
        if (isBarChart && dataPoint.pkgStats) {
            displayItems = visiblePackages.map(pkg => {
                const stats = dataPoint.pkgStats[pkg.name] || { downloads: 0, rateChangePercent: 0 };
                const value = viewMode === 'percent' ? stats.rateChangePercent : stats.downloads;
                return {
                    dataKey: pkg.name,
                    name: pkg.name,
                    value,
                    payload: dataPoint,
                    color: packageColors[packages.findIndex(p => p.name === pkg.name) % packageColors.length]
                };
            });
        } else {
            displayItems = payload.map((p: TooltipPayloadItem) => {
                const matchedPkg = packages.find(pkg => pkg.name === p.name);
                return {
                    ...p,
                    dataKey: matchedPkg ? matchedPkg.name : p.dataKey,
                    color: p.stroke || p.color || p.fill
                };
            });
        }

        const sortedItems = [...displayItems].sort((a, b) => (b.value || 0) - (a.value || 0));

        return (
            <div className="custom-tooltip">
                <p className="stat-label custom-tooltip-label">{dataPoint.formattedDate}</p>
                <div className="tooltip-grid">
                    {sortedItems.map((entry: TooltipPayloadItem, index: number) => {
                        const pkgId = entry.dataKey as string;
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
