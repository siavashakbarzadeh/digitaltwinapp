import { useState, useEffect, useCallback } from 'react';
import OfflineTwin from './pages/OfflineTwin';
import OnlineTwin from './pages/OnlineTwin';
import LiteratureReview from './pages/LiteratureReview';

type Tab = 'offline' | 'online' | 'literature';

export default function App() {
    const [tab, setTab] = useState<Tab>('offline');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [transitioning, setTransitioning] = useState(false);

    /* ── Scroll progress + scroll-to-top visibility ── */
    useEffect(() => {
        const onScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
            setShowScrollTop(scrollTop > 400);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* ── Keyboard shortcuts: 1 = Offline, 2 = Online, 3 = Literature ── */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === '1') switchTab('offline');
            else if (e.key === '2') switchTab('online');
            else if (e.key === '3') switchTab('literature');
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    /* ── Smooth tab switch with transition ── */
    const switchTab = useCallback((newTab: Tab) => {
        setTransitioning(true);
        setTimeout(() => {
            setTab(newTab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => setTransitioning(false), 50);
        }, 200);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <div className="app">
            {/* ── Scroll progress bar ── */}
            <div className="scroll-progress-track">
                <div
                    className="scroll-progress-bar"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

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
                            onClick={() => switchTab('offline')}
                            title="Press 1"
                        >
                            <span className="tab-icon">📊</span>
                            Offline
                            <span className="tab-shortcut">1</span>
                        </button>
                        <button
                            id="tab-online"
                            className={`tab-btn ${tab === 'online' ? 'active' : ''}`}
                            onClick={() => switchTab('online')}
                            title="Press 2"
                        >
                            <span className="tab-icon">🔴</span>
                            Online
                            {tab === 'online' && <span className="live-badge">LIVE</span>}
                            <span className="tab-shortcut">2</span>
                        </button>
                        <button
                            id="tab-literature"
                            className={`tab-btn ${tab === 'literature' ? 'active' : ''}`}
                            onClick={() => switchTab('literature')}
                            title="Press 3"
                        >
                            <span className="tab-icon">📚</span>
                            Literature Review
                            <span className="tab-shortcut">3</span>
                        </button>
                    </nav>
                </div>
            </header>

            {/* ── Content ── */}
            <main className={`app-main ${transitioning ? 'tab-exit' : 'tab-enter'}`}>
                {tab === 'offline' && <OfflineTwin />}
                {tab === 'online' && <OnlineTwin />}
                {tab === 'literature' && <LiteratureReview />}
            </main>

            {/* ── Scroll‑to‑top button ── */}
            <button
                className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 15V5M10 5L5 10M10 5L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {/* ── Footer ── */}
            <footer className="app-footer">
                <div className="footer-glow" />
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="footer-logo">⚡</span>
                        <div>
                            <div className="footer-title">Supercapacitor Digital Twin Platform</div>
                            <div className="footer-sub">PhD Research Demo · Physics-Informed LSTM + Online RLS</div>
                        </div>
                    </div>

                    <div className="footer-stats">
                        <div className="footer-stat">
                            <span className="footer-stat-icon">🔬</span>
                            <span className="footer-stat-val">3</span>
                            <span className="footer-stat-label">Models</span>
                        </div>
                        <div className="footer-stat">
                            <span className="footer-stat-icon">📊</span>
                            <span className="footer-stat-val">5</span>
                            <span className="footer-stat-label">Scenarios</span>
                        </div>
                        <div className="footer-stat">
                            <span className="footer-stat-icon">⚡</span>
                            <span className="footer-stat-val">RLS</span>
                            <span className="footer-stat-label">Real-time</span>
                        </div>
                        <div className="footer-stat">
                            <span className="footer-stat-icon">🧠</span>
                            <span className="footer-stat-val">PI</span>
                            <span className="footer-stat-label">LSTM</span>
                        </div>
                        <div className="footer-stat">
                            <span className="footer-stat-icon">🔋</span>
                            <span className="footer-stat-val">RC</span>
                            <span className="footer-stat-label">Circuit</span>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <span>Built with React + TypeScript + Recharts</span>
                        <span className="footer-separator">·</span>
                        <span>Keyboard shortcuts: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd></span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
