import { useState } from 'react';
import OfflineTwin from './pages/OfflineTwin';
import OnlineTwin from './pages/OnlineTwin';

export default function App() {
    const [tab, setTab] = useState<'offline' | 'online'>('offline');

    return (
        <div className="app">
            {/* ── Header ── */}
            <header className="app-header">
                <div className="header-content">
                    <div className="logo">
                        <div className="logo-icon">⚡</div>
                        <div>
                            <h1>Supercapacitor Digital Twin</h1>
                            <p className="subtitle">Physics‑Informed LSTM · Online RLS</p>
                        </div>
                    </div>

                    <nav className="tab-nav">
                        <button
                            id="tab-offline"
                            className={`tab-btn ${tab === 'offline' ? 'active' : ''}`}
                            onClick={() => setTab('offline')}
                        >
                            <span className="tab-icon">📊</span>
                            Offline Twin
                        </button>
                        <button
                            id="tab-online"
                            className={`tab-btn ${tab === 'online' ? 'active' : ''}`}
                            onClick={() => setTab('online')}
                        >
                            <span className="tab-icon">🔴</span>
                            Online Twin
                        </button>
                    </nav>
                </div>
            </header>

            {/* ── Content ── */}
            <main className="app-main">
                {tab === 'offline' ? <OfflineTwin /> : <OnlineTwin />}
            </main>

            {/* ── Footer ── */}
            <footer style={{
                textAlign: 'center',
                padding: '24px 20px 32px',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                borderTop: '1px solid var(--border)',
            }}>
                Research demo — Supercapacitor Digital Twin &nbsp;·&nbsp; PhD Thesis
            </footer>
        </div>
    );
}
