/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { BarChart3, Diff, Percent, Scaling } from 'lucide-react';
import { ComponentType } from 'react';

import { PeriodMetrics } from './types';
import {
    changeValueClass,
    numberFormatBasic,
    numberFormatBasicPercent,
    numberFormatChange,
    numberFormatChangePercent,
    numberFormatRatio,
    relativeValueClass,
} from './utils';

export enum ViewMode {
    absolute = 'absolute',
    percent = 'percent',
    absoluteChange = 'absolute-change',
    relative = 'relative',
}

export interface ViewModeTrait {
    metric: keyof PeriodMetrics;
    button: {
        label: string;
        tooltip: string;
        icon: ComponentType<{ size: number }>;
    };
    tooltip: {
        headerLabel: string;
        formatFn: (value: number) => string;
        valueClassFn: (value: number) => string;
    };
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

export const viewModeTraits: Record<ViewMode, ViewModeTrait> = {
    [ViewMode.absolute]: {
        metric: 'downloads',
        button: {
            label: 'Absolute',
            tooltip: 'Total Downloads',
            icon: BarChart3,
        },
        tooltip: {
            headerLabel: 'Total',
            formatFn: formatNumber,
            valueClassFn: () => '',
        },
    },
    [ViewMode.absoluteChange]: {
        metric: 'absoluteChange',
        button: {
            label: 'Net Change',
            tooltip: 'Absolute Change (Diff)',
            icon: Diff,
        },
        tooltip: {
            headerLabel: 'Net',
            formatFn: formatNumberChange,
            valueClassFn: changeValueClass,
        },
    },
    [ViewMode.percent]: {
        metric: 'rateChangePercent',
        button: {
            label: 'Rate',
            tooltip: 'Percentage Change',
            icon: Percent,
        },
        tooltip: {
            headerLabel: '%',
            formatFn: formatNumberChangePercent,
            valueClassFn: changeValueClass,
        },
    },
    [ViewMode.relative]: {
        metric: 'relativeToFirst',
        button: {
            label: 'Relative',
            tooltip: 'Relative to First Package',
            icon: Scaling,
        },
        tooltip: {
            headerLabel: 'Rel',
            formatFn: formatNumberRelative,
            valueClassFn: relativeValueClass,
        },
    },
};
