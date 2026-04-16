/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { Activity } from 'lucide-react';
import { FC } from 'react';

interface PlaceholderProps {
    loading: boolean;
}

export const Placeholder: FC<PlaceholderProps> = ({ loading }) => (
    <div className="chart-section">
        <div className="state-container">
            <Activity className={`state-icon ${loading ? 'spinning' : ''}`} />
            <p>{loading ? 'Loading chart view...' : 'No active data available to display.'}</p>
        </div>
    </div>
);
