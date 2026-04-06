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
    numberFormatBasicPercent,
    numberFormatChange,
    numberFormatChangePercent,
    numberFormatRatio,
} from '../utils';

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

const formatNumber = (num: number) => numberFormatBasic.format(num);
const formatNumberChange = (num: number) => numberFormatChange.format(num);
const formatNumberChangePercent = (num: number) => numberFormatChangePercent.format(num);
const formatNumberRelative = (num: number) => {
    if (num > 1) {
        return `${numberFormatRatio.format(num)}x`;
    } else if (num === 1) {
        return 'baseline';
    } else {
        return numberFormatBasicPercent.format(num);
    }
};

function classPosNeg(value: number) {
    if (value > 0) {
        return 'desirable-value';
    } else if (value < 0) {
        return 'undesirable-value';
    } else {
        return 'baseline-value';
    }
}

function classRelative(value: number) {
    if (value > 1) {
        return 'undesirable-value'; // Red for over 100%
    } else if (value < 1) {
        return 'desirable-value'; // Green for under 100%
    } else {
        return 'baseline-value';
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
                relativeToFirst: 0,
            };

            const value = stats[viewModeMetrics[viewMode]];
            const pkgIndex = packages.findIndex((p) => p.name === pkg.name);

            return {
                dataKey: pkg.name,
                name: pkg.name,
                value,
                payload: dataPoint,
                pkgClass: `pkg-${pkgIndex % 8}`,
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
                    <div className="stat-label secondary-value">Rel</div>

                    {displayItems.map((entry: TooltipPayloadItem, index: number) => {
                        const pkgId = entry.dataKey as string;
                        const stats = entry.payload.pkgStats?.[pkgId] || {
                            downloads: 0,
                            rateChangePercent: 0,
                            absoluteChange: 0,
                            relativeToFirst: 0,
                        };
                        const { downloads, rateChangePercent, absoluteChange, relativeToFirst } = stats;

                        const diffClass = classPosNeg(absoluteChange);
                        const pctClass = classPosNeg(rateChangePercent);
                        const relClass = classRelative(relativeToFirst);

                        const formattedAbs = formatNumber(downloads);
                        const formattedDiff = formatNumberChange(absoluteChange);
                        const formattedPct = formatNumberChangePercent(rateChangePercent);
                        const formattedRel = formatNumberRelative(relativeToFirst);

                        return (
                            <Fragment key={pkgId || index}>
                                <div className="tooltip-row-label">
                                    <span className={`stat-label ${entry.pkgClass}`}>
                                        {entry.name + ':'}
                                    </span>
                                </div>
                                <div className="tooltip-row-value">
                                    <span
                                        className={viewMode === ViewMode.absolute
                                            ? 'stat-value'
                                            : 'stat-label secondary-value'}
                                        style={{ fontWeight: viewMode === ViewMode.absolute ? 'bold' : 'normal' }}
                                    >
                                        {formattedAbs}
                                    </span>
                                </div>
                                <div className="tooltip-row-value">
                                    <span
                                        className={`${viewMode === ViewMode.absoluteChange
                                            ? 'stat-value'
                                            : 'stat-label secondary-value'} ${diffClass}`}
                                        style={{
                                            fontWeight: viewMode === ViewMode.absoluteChange ? 'bold' : 'normal',
                                        }}
                                    >
                                        {formattedDiff}
                                    </span>
                                </div>
                                <div className="tooltip-row-value">
                                    <span
                                        className={`${viewMode === ViewMode.percent
                                            ? 'stat-value'
                                            : 'stat-label secondary-value'} ${pctClass}`}
                                        style={{
                                            fontWeight: viewMode === ViewMode.percent ? 'bold' : 'normal',
                                        }}
                                    >
                                        {formattedPct}
                                    </span>
                                </div>
                                <div className="tooltip-row-value">
                                    <span
                                        className={`${viewMode === ViewMode.relative
                                            ? 'stat-value'
                                            : 'stat-label secondary-value'} ${relClass}`}
                                        style={{
                                            fontWeight: viewMode === ViewMode.relative ? 'bold' : 'normal',
                                        }}
                                    >
                                        {formattedRel}
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
