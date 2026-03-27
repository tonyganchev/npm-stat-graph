/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { format, parseISO, startOfMonth, startOfWeek, startOfYear } from 'date-fns';

import { ChartDataPoint, CombinedData, GroupBy, PackageConfig, PeriodMetrics } from './types';
import { isoDateFormat } from './utils';

const formatMdy = 'MMM d, yyyy' as const;
const formatMd = 'MMM d' as const;
const formatMy = 'MMMM yyyy' as const;
const formatY = 'yyyy' as const;

interface GroupByConfig {
    startDateFn: (d: Date) => Date;
    longFormat: string;
    shortFormat: string;
}
const config: Record<GroupBy, GroupByConfig> = {
    day: { startDateFn: (d: Date) => d, longFormat: formatMdy, shortFormat: formatMd },
    week: {
        startDateFn: (d: Date) => startOfWeek(d, { weekStartsOn: 1 }),
        longFormat: "'Week of' " + formatMdy,
        shortFormat: formatMd,
    },
    month: { startDateFn: startOfMonth, longFormat: formatMy, shortFormat: formatMy },
    year: { startDateFn: startOfYear, longFormat: formatY, shortFormat: formatY },
};

export function groupChartData(
    data: CombinedData[],
    groupBy: GroupBy,
    packages: PackageConfig[],
) {
    const { startDateFn, longFormat, shortFormat } = config[groupBy];

    return Map.groupBy(data, (item) => format(startDateFn(parseISO(item.day)), isoDateFormat)).entries().map(
        ([key, items]): ChartDataPoint => {
            const groupStart = startDateFn(parseISO(items[0].day));

            return {
                day: key,
                formattedDate: format(groupStart, longFormat),
                shortDate: format(groupStart, shortFormat),
                pkgStats: Object.fromEntries(packages.map((p) => [
                    p.name,
                    {
                        downloads: items.reduce((sum, item) => sum + (item.packages[p.name] || 0), 0),
                        rateChangePercent: 0,
                        absoluteChange: 0,
                    } as PeriodMetrics,
                ])),
                absMax: 0,
                displayMax: 0,
                displayMin: 0,
            };
        })
        .toArray()
        .sort((a, b) => a.day.localeCompare(b.day));
}
