/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { format, parseISO, startOfMonth, startOfWeek, startOfYear } from 'date-fns';

import { ChartDataPoint, CombinedData, GroupBy, PackageConfig } from './types';

export function groupChartData(
    data: CombinedData[],
    groupBy: GroupBy,
    packages: PackageConfig[],
) {
    const config = {
        day: { start: (d: Date) => d, fmt: 'MMM d, yyyy', shortFmt: 'MMM d' },
        week: { start: startOfWeek, fmt: 'Week of MMM d, yyyy', shortFmt: 'MMM d' },
        month: { start: startOfMonth, fmt: 'MMMM yyyy', shortFmt: 'MMM yyyy' },
        year: { start: startOfYear, fmt: 'yyyy', shortFmt: 'yyyy' },
    };

    const { start: getStart, fmt, shortFmt } = config[groupBy];

    const bucketsMap = Map.groupBy(data, (item) => {
        const groupStart = getStart(parseISO(item.day));
        return format(groupStart, 'yyyy-MM-dd');
    });

    return bucketsMap.entries().map(
        ([key, items]): ChartDataPoint => {
            const firstDate = parseISO(items[0].day);
            const groupStart = getStart(firstDate);

            return {
                day: key,
                formattedDate: format(groupStart, fmt),
                shortDate: format(groupStart, shortFmt),
                pkgStats: Object.fromEntries(packages.map((p) => [
                    p.name,
                    {
                        downloads: items.reduce((sum, item) => sum + (item.packages[p.name] || 0), 0),
                        rateChangePercent: 0,
                    },
                ])),
                absMax: 0,
                displayMax: 0,
                displayMin: 0,
            };
        })
        .toArray()
        .sort((a, b) => a.day.localeCompare(b.day));
}
