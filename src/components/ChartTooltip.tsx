/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { FC, Fragment } from 'react';

import { ChartDataPoint, PackageConfig } from '../types';
import { packageColors } from '../utils';
import { ViewMode, viewModeTraits } from '../viewMode';

interface TooltipPayloadItem {
    dataKey?: string | number;
    name?: string;
    value?: number;
    payload: ChartDataPoint;
    pkgClass?: string;
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

const noMetrics = {
    downloads: 0,
    rateChangePercent: 0,
    absoluteChange: 0,
    relativeToFirst: 0,
};

export const ChartTooltip: FC<ChartTooltipProps> = ({ active, payload, visiblePackages, packages, viewMode }) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;

        const displayItems: TooltipPayloadItem[] = visiblePackages.map((pkg) => {
            const stats = dataPoint.pkgStats[pkg.name] || noMetrics;

            const value = stats[viewModeTraits[viewMode].metric];
            const pkgIndex = packages.findIndex((p) => p.name === pkg.name);

            return {
                dataKey: pkg.name,
                name: pkg.name,
                value,
                payload: dataPoint,
                pkgClass: `pkg-${pkgIndex % packageColors.length}`,
            };
        }).sort((a, b) => b.value - a.value);

        return (
            <div className="custom-tooltip">
                <p className="stat-label custom-tooltip-label">{dataPoint.formattedDate}</p>
                <div className="tooltip-grid">
                    <div />
                    {Object.values(viewModeTraits).map((trait) => (
                        <div className="stat-label secondary-value">
                            {trait.tooltip.headerLabel}
                        </div>
                    ))}

                    {displayItems.map((entry: TooltipPayloadItem, index: number) => {
                        const pkgId = entry.dataKey as string;
                        const stats = entry.payload.pkgStats[pkgId] || noMetrics;

                        return (
                            <Fragment key={pkgId || index}>
                                <div className="tooltip-row-label">
                                    <span className={`stat-label ${entry.pkgClass}`}>
                                        {entry.name + ':'}
                                    </span>
                                </div>
                                {Object.entries(viewModeTraits).map(([vm, traits]) => (
                                    <div className="tooltip-row-value">
                                        <span
                                            className={`${viewMode === vm
                                                ? 'stat-value'
                                                : 'stat-label secondary-value'}
                                                ${traits.tooltip.valueClassFn(stats[traits.metric])}`}
                                            style={{ fontWeight: viewMode === vm ? 'bold' : 'normal' }}
                                        >
                                            {traits.tooltip.formatFn(stats[traits.metric])}
                                        </span>
                                    </div>
                                ))}
                            </Fragment>
                        );
                    })}
                </div>
            </div>
        );
    }
    return null;
};
