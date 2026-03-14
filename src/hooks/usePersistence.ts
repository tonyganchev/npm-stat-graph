import { useState, useCallback } from 'react';
import { AppState } from '../types';
import { DateRangeType, calculateDateRange } from '../api/npmApi';
import { defaultPackage } from '../utils';

const STORAGE_KEY = 'npm-stats-state';

export function usePersistence() {
    const loadInitialState = (): AppState => {
        const params = new URLSearchParams(window.location.search);
        
        const getParam = (key: string) => params.get(key);
        const parseJSON = (str: string | null) => {
            if (!str) return null;
            try { return JSON.parse(decodeURIComponent(str)); }
            catch { return null; }
        };

        const urlPkgs = parseJSON(getParam('packages'));
        const urlRange = getParam('range') as DateRangeType;
        const urlDays = parseJSON(getParam('days'));

        let state: Partial<AppState> | null = null;

        if (urlPkgs && Array.isArray(urlPkgs) && urlPkgs.length > 0) {
            state = {
                packages: urlPkgs,
                range: urlRange || 'last-30-days',
                customStart: getParam('customStart') || '',
                customEnd: getParam('customEnd') || '',
                enabledDays: urlDays || [0, 1, 2, 3, 4, 5, 6],
                viewMode: (getParam('viewMode') as any) || 'absolute'
            };
        } else {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.packages?.length > 0) state = parsed;
                } catch { }
            }
        }

        const finalState: AppState = {
            packages: state?.packages || [{ id: '1', name: defaultPackage, visible: true }],
            range: state?.range || 'last-30-days',
            customStart: state?.customStart || '',
            customEnd: state?.customEnd || '',
            enabledDays: state?.enabledDays || [0, 1, 2, 3, 4, 5, 6],
            viewMode: state?.viewMode || 'absolute'
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
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

            // Sync URL
            const url = new URL(window.location.href);
            url.searchParams.set('packages', encodeURIComponent(JSON.stringify(newState.packages)));
            url.searchParams.set('range', newState.range);
            url.searchParams.set('days', encodeURIComponent(JSON.stringify(newState.enabledDays)));
            
            if (newState.range === 'custom') {
                url.searchParams.set('customStart', newState.customStart);
                url.searchParams.set('customEnd', newState.customEnd);
            } else {
                url.searchParams.delete('customStart');
                url.searchParams.delete('customEnd');
            }
            
            url.searchParams.set('viewMode', newState.viewMode);
            
            window.history.replaceState({}, '', url.toString());
            return newState;
        });
    }, []);

    return { state, updateSync };
}
