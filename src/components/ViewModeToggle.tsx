/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { FC } from 'react';

import { ViewMode, viewModeTraits } from '../viewMode';

export interface ViewModeToggleProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

export const ViewModeToggle: FC<ViewModeToggleProps> = ({ viewMode, setViewMode }) => (
    <div className="view-mode-toggle filter-chips">
        {
            Object.entries(viewModeTraits).map(([mode, trait]) => (
                <button
                    onClick={() => setViewMode(mode as ViewMode)}
                    className={`filter-chip ${viewMode === mode ? 'active' : ''}`}
                    title={trait.button.tooltip}
                >
                    <trait.button.icon size={16} />
                    <span>{trait.button.label}</span>
                </button>
            ))
        }
    </div>
);
