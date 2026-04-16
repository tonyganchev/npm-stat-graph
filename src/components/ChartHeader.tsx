/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { memo, useMemo } from 'react';

import { ChartType } from '../chartType';
import { ChartDataPoint, GroupBy, PackageConfig } from '../types';
import {
    changeValueClass,
    formatCompact,
    formatRatio,
    numberFormatChange,
    numberFormatChangePercent,
    packageColors,
    relativeValueClass,
} from '../utils';
import { ViewMode, viewModeTraits } from '../viewMode';

const groupByTitle = {
    day: 'Daily',
    week: 'Weekly',
    month: 'Monthly',
    year: 'Yearly',
} as const;

const viewModeTitle = {
    [ViewMode.absolute]: 'Downloads',
    [ViewMode.percent]: 'Change',
    [ViewMode.absoluteChange]: 'Net Change',
    [ViewMode.relative]: 'Relative Support',
} as const;

function summaryStatusClass(isRelative: boolean, val: number, isChange: boolean) {
    if (isRelative) {
        return relativeValueClass(val);
    } else if (isChange) {
        return changeValueClass(val);
    }
    return '';
}

function formattedSummaryValue(isRelative: boolean, val: number, viewMode: ViewMode) {
    if (isRelative) {
        return formatRatio(val) + ' avg';
    }
    if (viewMode === ViewMode.percent) {
        return numberFormatChangePercent.format(val) + ' avg';
    }
    if (viewMode === ViewMode.absoluteChange) {
        return numberFormatChange.format(Math.round(val)) + ' avg';
    }
    return formatCompact(val);
}

interface ChartHeaderProps {
    chartData: ChartDataPoint[];
    packages: PackageConfig[];
    visiblePackages: PackageConfig[];
    groupBy?: GroupBy;
    enabledDays: number[];
    viewMode: ViewMode;
    chartType: ChartType;
}

export const ChartHeader = memo(({
    chartData,
    packages,
    visiblePackages,
    groupBy = 'day',
    viewMode,
}: ChartHeaderProps) => {
    const packageSortValues = useMemo(() => {
        const values: { [name: string]: number } = {};
        packages.forEach((p) => values[p.name] = 0);

        const count = chartData.length || 1;
        chartData.forEach((item) => {
            packages.forEach((p) => {
                const stats = item.pkgStats?.[p.name];
                values[p.name] += stats[viewModeTraits[viewMode].metric];
            });
        });

        if (viewMode === ViewMode.percent || viewMode === ViewMode.absoluteChange || viewMode === ViewMode.relative) {
            packages.forEach((p) => {
                values[p.name] = values[p.name] / count;
            });
        }
        return values;
    }, [chartData, packages, viewMode]);

    return (
        <div className="chart-header">
            <div className="stat-summary stat-summary-main">
                <span className="stat-label">
                    {groupByTitle[groupBy]}
                    &nbsp;
                    {viewModeTitle[viewMode]}
                </span>
            </div>
            <div className="chart-summary-group">
                {[...visiblePackages]
                    .sort((a, b) => (packageSortValues[b.name] || 0) - (packageSortValues[a.name] || 0))
                    .map((pkg, i) => {
                        const originalIndex = packages.findIndex((p) => p.name === pkg.name);
                        const pkgClass = `pkg-${originalIndex % packageColors.length}`;
                        const val = packageSortValues[pkg.name] || 0;
                        const isChange = viewMode === ViewMode.percent || viewMode === ViewMode.absoluteChange;
                        const isRelative = viewMode === ViewMode.relative;

                        const statusClass = summaryStatusClass(isRelative, val, isChange);

                        const formattedValue = formattedSummaryValue(isRelative, val, viewMode);

                        return (
                            <div className="stat-summary" key={i}>
                                <span className={`stat-label ${pkgClass}`}>{pkg.name}</span>
                                <span className={`stat-value ${statusClass}`}>
                                    {formattedValue}
                                </span>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
});
