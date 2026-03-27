/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { BarChart3, Diff, Percent } from 'lucide-react';
import { FC } from 'react';

import { ViewMode } from '../types';

export interface ViewModeToggleProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

export const ViewModeToggle: FC<ViewModeToggleProps> = ({ viewMode, setViewMode }) => (
    <div className="view-mode-toggle filter-chips">
        <button
            onClick={() => setViewMode(ViewMode.absolute)}
            className={`filter-chip ${viewMode === ViewMode.absolute ? 'active' : ''}`}
            title="Total Downloads"
        >
            <BarChart3 size={16} />
            <span>Absolute</span>
        </button>
        <button
            onClick={() => setViewMode(ViewMode.absoluteChange)}
            className={`filter-chip ${viewMode === ViewMode.absoluteChange ? 'active' : ''}`}
            title="Absolute Change (Diff)"
        >
            <Diff size={16} />
            <span>Net Change</span>
        </button>
        <button
            onClick={() => setViewMode(ViewMode.percent)}
            className={`filter-chip ${viewMode === ViewMode.percent ? 'active' : ''}`}
            title="Percentage Change"
        >
            <Percent size={14} />
            <span>Percent</span>
        </button>
    </div>
);
