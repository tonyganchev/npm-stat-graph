/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/npm-stat-graph/',
    plugins: [
        react()
    ],
    server: {
        host: '0.0.0.0',
        allowedHosts: ['localhost', 'tsohlacol', '127.0.0.1', '0.0.0.0', 'desktop.home.tonyganchev.com']
    }
})
