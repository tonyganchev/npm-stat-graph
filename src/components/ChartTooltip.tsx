/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { FC, Fragment } from 'react';

import { ChartDataPoint, PackageConfig, ViewMode, viewModeMetrics } from '../types';
import {
    numberFormatBasic,
    numberFormatChange,
    numberFormatChangePercent,
    packageColors,
} from '../utils';

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

const formatNumber = (num: number) => numberFormatBasic.format(num);
const formatNumberChange = (num: number) => numberFormatChange.format(num);
const formatNumberChangePercent = (num: number) => numberFormatChangePercent.format(num);

const colorPositive = '#10b981';
const colorNegative = '#ff5252';
const colorZero = '#94a3b8';

function colorPosNeg(value: number) {
    if (value > 0) {
        return colorPositive;
    } else if (value < 0) {
        return colorNegative;
    } else {
        return colorZero;
    }
}

export const ChartTooltip: FC<ChartTooltipProps> = ({ active, payload, visiblePackages, packages, viewMode }) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;

        const displayItems: TooltipPayloadItem[] = visiblePackages.map((pkg) => {
            const stats = dataPoint.pkgStats?.[pkg.name] || {
                downloads: 0,
                rateChangePercent: 0,
                absoluteChange: 0,
            };

            const value = stats[viewModeMetrics[viewMode]];

            return {
                dataKey: pkg.name,
                name: pkg.name,
                value,
                payload: dataPoint,
                color: packageColors[packages.findIndex((p) => p.name === pkg.name) % packageColors.length],
            };
        }).sort((a, b) => (b.value || 0) - (a.value || 0));

        return (
            <div className="custom-tooltip">
                <p className="stat-label custom-tooltip-label">{dataPoint.formattedDate}</p>
                <div className="tooltip-grid">
                    <div />
                    <div className="stat-label secondary-value">Total</div>
                    <div className="stat-label secondary-value">Net</div>
                    <div className="stat-label secondary-value">%</div>

                    {displayItems.map((entry: TooltipPayloadItem, index: number) => {
                        const pkgId = entry.dataKey as string;
                        const stats = entry.payload.pkgStats?.[pkgId] || {
                            downloads: 0,
                            rateChangePercent: 0,
                            absoluteChange: 0,
                        };
                        const { downloads, rateChangePercent, absoluteChange } = stats;

                        const diffColor = colorPosNeg(absoluteChange);
                        const pctColor = colorPosNeg(rateChangePercent);

                        const formattedAbs = formatNumber(downloads);
                        const formattedDiff = formatNumberChange(absoluteChange);
                        const formattedPct = formatNumberChangePercent(rateChangePercent);

                        return (
                            <Fragment key={pkgId || index}>
                                <div className="tooltip-row-label">
                                    <span className="stat-label" style={{ color: entry.color }}>
                                        {entry.name + ':'}
                                    </span>
                                </div>
                                <div className="tooltip-row-value">
                                    <span
                                        className={viewMode === ViewMode.absolute
                                            ? 'stat-value'
                                            : 'stat-label secondary-value'}
                                        style={{
                                            color: '#f8fafc',
                                            fontWeight: viewMode === ViewMode.absolute ? 'bold' : 'normal',
                                        }}
                                    >
                                        {formattedAbs}
                                    </span>
                                </div>
                                <div className="tooltip-row-value">
                                    <span
                                        className={viewMode === ViewMode.absoluteChange
                                            ? 'stat-value'
                                            : 'stat-label secondary-value'}
                                        style={{
                                            color: diffColor,
                                            fontWeight: viewMode === ViewMode.absoluteChange ? 'bold' : 'normal',
                                        }}
                                    >
                                        {formattedDiff}
                                    </span>
                                </div>
                                <div className="tooltip-row-value">
                                    <span
                                        className={viewMode === ViewMode.percent
                                            ? 'stat-value'
                                            : 'stat-label secondary-value'}
                                        style={{
                                            color: pctColor,
                                            fontWeight: viewMode === ViewMode.percent ? 'bold' : 'normal',
                                        }}
                                    >
                                        {formattedPct}
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
