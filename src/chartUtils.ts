/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { format, parseISO, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { CombinedData, GroupBy, PackageConfig } from './types';

export function groupChartData(
    data: CombinedData[], 
    groupBy: GroupBy, 
    packages: PackageConfig[]
) {
    if (groupBy === 'day') {
        return data.map(item => {
            const dateObj = parseISO(item.day);
            const dayItem: any = {
                day: item.day,
                formattedDate: format(dateObj, 'MMM d, yyyy'),
                shortDate: format(dateObj, 'MMM d'),
            };
            packages.forEach(p => {
                dayItem[p.id] = item.packages[p.id] || 0;
            });
            return dayItem;
        });
    }

    const groupedMap = new Map<string, anu>();

    data.forEach(item => {
        const dateObj = parseISO(item.day);
        let groupStart = dateObj;
        let fmt = 'MMM d, yyyy';
        let shortFmt = 'MMM d';

        if (groupBy === 'week') {
            groupStart = startOfWeek(dateObj);
            fmt = "'Week of' MMM d, yyyy";
        } else if (groupBy === 'month') {
            groupStart = startOfMonth(dateObj);
            fmt = "MMMM yyyy";
            shortFmt = "MMM yyyy";
        } else if (groupBy === 'year') {
            groupStart = startOfYear(dateObj);
            fmt = "yyyy";
            shortFmt = "yyyy";
        }

        const key = groupStart.toISOString();

        if (!groupedMap.has(key)) {
            groupedMap.set(key, {
                day: key,
                formattedDate: format(groupStart, fmt),
                shortDate: format(groupStart, shortFmt)
            });
            packages.forEach(p => groupedMap.get(key)![p.id] = 0);
        }

        const current = groupedMap.get(key)!;
        packages.forEach(p => {
            if (item.packages[p.id]) {
                current[p.id] += item.packages[p.id];
            }
        });
    });

    return Array.from(groupedMap.values()).sort((a, b) => a.day.localeCompare(b.day));
}
