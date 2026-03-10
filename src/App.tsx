import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { SearchControls } from './components/SearchControls';
import { StatChart } from './components/StatChart';
import { fetchPackageStats, DownloadStat } from './api/npmApi';

function App() {
    const [data, setData] = useState<DownloadStat[] | null>(null);
    const [pkgName, setPkgName] = useState('react');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (pkg: string, range: "last-7-days" | "last-30-days" | "last-year") => {
        setIsLoading(true);
        setError(null);
        setPkgName(pkg);
        try {
            const stats = await fetchPackageStats(pkg, range);
            setData(stats.downloads);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            setData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial load
        handleSearch('react', 'last-30-days');
    }, []);

    return (
        <div className="app-container">
            <header>
                <h1>
                    <TrendingUp style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'bottom' }} size={40} />
                    npm-stats
                </h1>
                <p>Beautiful download statistics for npm packages</p>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
                <SearchControls onSearch={handleSearch} isLoading={isLoading} />

                {error && (
                    <div className="glass-panel state-container">
                        <AlertCircle className="state-icon" style={{ color: 'var(--error-color)', opacity: 1 }} />
                        <div className="error-text">
                            <p style={{ color: 'inherit', fontWeight: 'bold' }}>Error fetching data</p>
                            <p style={{ color: 'inherit', marginTop: '0.25rem' }}>{error}</p>
                        </div>
                    </div>
                )}

                {!error && data && (
                    <StatChart data={data} packageName={pkgName} />
                )}
            </main>

            <footer style={{ textAlign: 'center', marginTop: 'auto', padding: '1rem 0', color: 'var(--text-secondary)' }}>
                <p>Not affiliated with npm, Inc.</p>
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <a href="https://github.com/npm/registry/blob/master/docs/download-counts.md" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                        API Registry Docs
                    </a>
                </div>
            </footer>
        </div>
    );
}

export default App;
