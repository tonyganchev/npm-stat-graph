import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simple in-memory cache for dev server
const apiCache = new Map();

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        {
            name: 'npm-api-cache',
            configureServer(server) {
                const handleCachedRequest = async (req: any, res: any, targetBaseUrl: string, proxyPrefix: string, checkImmutable: boolean = false) => {
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

                server.middlewares.use('/api/npm', (req, res) => handleCachedRequest(req, res, 'https://api.npmjs.org', '/api/npm', true));
                server.middlewares.use('/api/search', (req, res) => handleCachedRequest(req, res, 'https://registry.npmjs.org/-/v1/search', '/api/search', false));
            }
        }
    ],
})
