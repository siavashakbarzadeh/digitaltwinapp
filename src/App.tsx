import { useState } from 'react';
import OfflineTwin from './pages/OfflineTwin';
import OnlineTwin from './pages/OnlineTwin';
import LiteratureReview from './pages/LiteratureReview';

type Tab = 'offline' | 'online' | 'literature';

export default function App() {
    const [tab, setTab] = useState<Tab>('offline');

    return (
        <div className="app">
            {/* ── Header ── */}
            <header className="app-header">
                {/* Animated particles */}
                <div className="header-particles">
                    <span /><span /><span /><span /><span /><span /><span /><span />
                </div>

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
                        <button
                            id="tab-literature"
                            className={`tab-btn ${tab === 'literature' ? 'active' : ''}`}
                            onClick={() => setTab('literature')}
                        >
                            <span className="tab-icon">📚</span>
                            Literature Review offline
                        </button>
                    </nav>
                </div>
            </header>

            {/* ── Content ── */}
            <main className="app-main">
                {tab === 'offline' && <OfflineTwin />}
                {tab === 'online' && <OnlineTwin />}
                {tab === 'literature' && <LiteratureReview />}
            </main>

            {/* ── Footer ── */}
            <footer style={{
                textAlign: 'center',
                padding: '32px 20px 40px',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                borderTop: '1px solid var(--border)',
            }}>
                <div style={{ marginBottom: 8, fontSize: '1.2rem' }}>⚡</div>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Supercapacitor Digital Twin Platform
                </div>
                <div>Research demo &nbsp;·&nbsp; PhD Thesis &nbsp;·&nbsp; Physics-Informed LSTM + Online RLS</div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 24, fontSize: '0.65rem' }}>
                    <span>🔬 3 Models</span>
                    <span>📊 5 Scenarios</span>
                    <span>⚡ Real-time RLS</span>
                    <span>🧠 PI-LSTM</span>
                </div>
            </footer>
        </div>
    );
}

