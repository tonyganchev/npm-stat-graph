/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { useState, useCallback } from 'react';
import { AppState, ChartType, ViewMode, PackageConfig } from '../types';
import { DateRangeType, calculateDateRange } from '../api/npmApi';
import { defaultPackage } from '../utils';

const storageKey = 'npm-stat-graph-state';

export function usePersistence() {
    const loadInitialState = (): AppState => {
        const params = new URLSearchParams(window.location.search);
 
        const urlPkgsRaw = params.get('packages');
        let urlPkgs: PackageConfig[] | null = null;
        if (urlPkgsRaw) {
            urlPkgs = urlPkgsRaw.split(',').map(p => {
                const visible = !p.startsWith('!');
                const name = visible ? p : p.substring(1);
                // Ensure we decode the package name to avoid double encoding if it was already encoded in the URL
                return { name: decodeURIComponent(name), visible };
            });
        }

        const urlRange = params.get('range') as DateRangeType;
        const urlDaysRaw = params.get('days');
        const urlDays = urlDaysRaw ? urlDaysRaw.split(',').map(Number) : null;

        let state: Partial<AppState> | null = null;

        if (urlPkgs && urlPkgs.length > 0) {
            state = {
                packages: urlPkgs,
                range: urlRange || 'last-30-days',
                customStart: params.get('customStart') || '',
                customEnd: params.get('customEnd') || '',
                enabledDays: urlDays || [0, 1, 2, 3, 4, 5, 6],
                viewMode: ['absolute', 'percent'].includes(params.get('viewMode') as string) ? params.get('viewMode') as ViewMode : 'absolute',
                chartType: ['line', 'bar'].includes(params.get('chartType') as string) ? params.get('chartType') as ChartType : 'line'
            };
        } else {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.packages?.length > 0) {
                        state = parsed;
                    }
                } catch { }
            }
        }

        const finalState: AppState = {
            packages: state?.packages || [{ name: defaultPackage, visible: true }],
            range: state?.range || 'last-30-days',
            customStart: state?.customStart || '',
            customEnd: state?.customEnd || '',
            enabledDays: state?.enabledDays || [0, 1, 2, 3, 4, 5, 6],
            viewMode: state?.viewMode || 'absolute',
            chartType: state?.chartType || 'line'
        };

        if (finalState.range !== 'custom') {
            const { start, end } = calculateDateRange(finalState.range);
            finalState.customStart = start;
            finalState.customEnd = end;
        }

        return finalState;
    };

    const [state, setState] = useState<AppState>(loadInitialState);

    const updateSync = useCallback((updates: Partial<AppState>) => {
        setState(prev => {
            const newState = { ...prev, ...updates };
            
            // Sync LocalStorage
            localStorage.setItem(storageKey, JSON.stringify(newState));

            // Sync URL
            const url = new URL(window.location.href);
            const pkgsStr = newState.packages.map(p => p.visible ? p.name : `!${p.name}`).join(',');
            url.searchParams.set('packages', pkgsStr);
            url.searchParams.set('range', newState.range);
            url.searchParams.set('days', newState.enabledDays.join(','));
            
            if (newState.range === 'custom') {
                url.searchParams.set('customStart', newState.customStart);
                url.searchParams.set('customEnd', newState.customEnd);
            } else {
                url.searchParams.delete('customStart');
                url.searchParams.delete('customEnd');
            }
            
            url.searchParams.set('viewMode', newState.viewMode);
            url.searchParams.set('chartType', newState.chartType);
            
            // Clean up the query string to be more human-readable after URLSearchParams encodes it.
            // Using replaceAll with literal strings is more direct than regex.
            const cleanSearch = url.searchParams.toString()
                .replaceAll('%2C', ',')
                .replaceAll('%21', '!')
                .replaceAll('%40', '@')
                .replaceAll('%2F', '/')
                .replaceAll('%3A', ':');
            
            const finalUrl = `${url.origin}${url.pathname}${cleanSearch ? '?' + cleanSearch : ''}${url.hash}`;
            window.history.replaceState({}, '', finalUrl);
            return newState;
        });
    }, []);

    return { state, updateSync };
}
