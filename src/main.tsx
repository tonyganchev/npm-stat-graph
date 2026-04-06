/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

// Patch addEventListener to optimize touch event performance
// and fix [Violation] warnings. This ensures that
// touchstart and touchmove listeners are passive by default.
(function () {
    if (typeof window !== 'undefined' && typeof EventTarget !== 'undefined') {
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function (
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions,
        ) {
            let finalOptions = options;
            if (type === 'touchstart' || type === 'touchmove') {
                if (typeof options === 'undefined') {
                    finalOptions = { passive: true };
                } else if (typeof options === 'boolean') {
                    finalOptions = { capture: options, passive: true };
                } else if (typeof options === 'object' && options.passive === undefined) {
                    finalOptions = { ...options, passive: true };
                }
            }
            return originalAddEventListener.call(this, type, listener, finalOptions);
        };
    }
})();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
