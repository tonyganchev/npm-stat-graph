/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { defineConfig, type Connect } from 'vite'
import react from '@vitejs/plugin-react'
import type { ServerResponse } from 'node:http'

const apiCache = new Map();

export default defineConfig({
    base: '/npm-stat-graph/',
    plugins: [
        react(),
        {
            name: 'npm-api-cache',
            configureServer(server) {
                const cachedRequest = async (
                    req: Connect.IncomingMessage,
                    res: ServerResponse,
                    targetBaseUrl: string,
                    proxyPrefix: string,
                    checkImmutable: boolean = false) => {

                    try {
                        const urlPath = req.originalUrl?.replace(proxyPrefix, '') || '';
                        const targetUrl = `${targetBaseUrl}${urlPath}`;

                        if (apiCache.has(targetUrl)) {
                            const cached = apiCache.get(targetUrl);
                            let isImmutable = false;

                            if (checkImmutable) {
                                const rangeMatch = urlPath.match(/\/downloads\/range\/[^:]+:([^/]+)/);
                                const endDate = rangeMatch ? rangeMatch[1] : null;
                                const todayStr = new Date().toISOString().split('T')[0];
                                isImmutable = !!(endDate && endDate < todayStr);
                            }

                            const isExpired = Date.now() - cached.timestamp > 10 * 60 * 1000;

                            if (isImmutable || !isExpired) {
                                console.log(`[Dev Cache Hit${isImmutable ? ' (Immutable)' : ''}] ${targetUrl}`);
                                res.setHeader('Content-Type', 'application/json');
                                res.end(cached.data);
                                return;
                            } else {
                                console.log(`[Dev Cache Expired] ${targetUrl}`);
                                apiCache.delete(targetUrl);
                            }
                        }

                        console.log(`[Dev Cache Miss] Fetching ${targetUrl}`);
                        const fetchRes = await fetch(targetUrl);

                        if (!fetchRes.ok) {
                            res.statusCode = fetchRes.status;
                            res.end(await fetchRes.text());
                            return;
                        }

                        const data = await fetchRes.text();
                        apiCache.set(targetUrl, { data, timestamp: Date.now() });

                        res.setHeader('Content-Type', 'application/json');
                        res.end(data);
                    } catch (err) {
                        console.error('Proxy Cache Error:', err);
                        res.statusCode = 500;
                        res.end(String(err));
                    }
                };

                server.middlewares.use(
                    '/api/npm',
                    (req, res) =>
                        cachedRequest(req, res, 'https://api.npmjs.org', '/api/npm', true));
                server.middlewares.use(
                    '/api/search',
                    (req, res) =>
                        cachedRequest(req, res, 'https://registry.npmjs.org/-/v1/search', '/api/search', false));
            }
        }
    ],
    server: {
        host: '0.0.0.0',
        allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', 'desktop.home.tonyganchev.com']
    }
})
