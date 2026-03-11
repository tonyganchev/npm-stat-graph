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
                server.middlewares.use('/api/npm', async (req, res) => {
                    try {
                        // Reconstruct the target URL
                        const urlPath = req.originalUrl?.replace('/api/npm', '') || '';
                        const targetUrl = `https://api.npmjs.org${urlPath}`;

                        if (apiCache.has(targetUrl)) {
                            const cached = apiCache.get(targetUrl);
                            if (Date.now() - cached.timestamp <= 10 * 60 * 1000) {
                                console.log(`[Dev Cache Hit] ${targetUrl}`);
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
                });
            }
        }
    ],
})
