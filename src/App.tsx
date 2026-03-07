import AssetOverview from './pages/AssetOverview';
import DigitalTwinView from './pages/DigitalTwinView';
import ScenarioSelector from './pages/ScenarioSelector';
import InfoExplanation from './pages/InfoExplanation';
import ComparisonView from './pages/ComparisonView';
import LiteratureReview from './pages/LiteratureReview';
import OfflineTwin from './pages/OfflineTwin';
import OnlineTwin from './pages/OnlineTwin';
import { scenarios, Scenario, AssetType, DeviceCondition } from './data/scenarios';
import { useState, useEffect, useCallback } from 'react';
import { mae, rmse } from './utils/metrics';

import { HistoryEntry } from './types';
import { Tab } from './types';

export default function App() {
    const [tab, setTab] = useState<Tab>('hub');
    const [selectedScenarioId, setSelectedScenarioId] = useState('sc-new-90a');
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [transitioning, setTransitioning] = useState(false);

    /* ── Scroll progress ── */
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

    /* ── Keyboard shortcuts ── */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === '1') switchTab('hub');
            else if (e.key === '2') switchTab('literature');
            else if (e.key === '3') switchTab('offline_twin');
            else if (e.key === '4') switchTab('online_twin');
            else if (e.key === '5') switchTab('twin_view');
            else if (e.key === '6') switchTab('comparison');
            else if (e.key === '7') switchTab('scenarios');
            else if (e.key === '8') switchTab('info');
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    /* ── Smooth tab switch ── */
    const switchTab = useCallback((newTab: Tab) => {
        setTransitioning(true);
        setTimeout(() => {
            setTab(newTab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => setTransitioning(false), 50);
        }, 200);
    }, []);

    const handleScenarioSelect = useCallback((id: string) => {
        setSelectedScenarioId(id);

        // Record in history when selected
        const scenario = scenarios.find(s => s.id === id);
        if (scenario) {
            const m = scenario.data.map(d => d.measuredVoltage);
            const p = scenario.data.map(d => d.piLstmVoltage);
            const entry: HistoryEntry = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toLocaleTimeString(),
                assetType: scenario.assetType,
                scenarioName: scenario.name,
                condition: scenario.condition,
                mae: mae(m, p),
                rmse: rmse(m, p),
                soh: scenario.soh
            };
            setHistory((prev: HistoryEntry[]) => [entry, ...prev.slice(0, 4)]);
        }
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const tabConfig = [
        { id: 'hub' as Tab, icon: '🏠', label: 'Master Hub', shortcut: '1' },
        { id: 'literature' as Tab, icon: '📖', label: 'Lit. Review', shortcut: '2' },
        { id: 'offline_twin' as Tab, icon: '📊', label: 'Offline Parameters', shortcut: '3' },
        { id: 'online_twin' as Tab, icon: '🏗️', label: 'Online Parameters', shortcut: '4' },
        { id: 'twin_view' as Tab, icon: '📈', label: 'Twin View', shortcut: '5' },
        { id: 'comparison' as Tab, icon: '⚖️', label: 'Compare', shortcut: '6' },
        { id: 'scenarios' as Tab, icon: '⚡', label: 'Scenarios', shortcut: '7' },
        { id: 'info' as Tab, icon: 'ℹ️', label: 'About', shortcut: '8' },
    ];

    return (
        <div className="app-container">
            {/* ── Sidebar ── */}
            <aside className="app-sidebar">
                <div className="sidebar-header">
                    <div className="logo-icon">⚡</div>
                    <div className="logo-text">
                        <h3>Digital Twin</h3>
                        <p>PhD Research</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {tabConfig.map((t) => (
                        <button
                            key={t.id}
                            className={`nav-item ${tab === t.id ? 'active' : ''}`}
                            onClick={() => switchTab(t.id)}
                            title={`Press ${t.shortcut}`}
                        >
                            <span className="nav-icon">{t.icon}</span>
                            <span className="nav-label">{t.label}</span>
                            <span className="nav-shortcut">{t.shortcut}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="active-scenario-card" style={{ position: 'relative' }}>
                        {scenarios.find(s => s.id === selectedScenarioId)?.assetType === 'battery' && (
                            <div style={{ position: 'absolute', top: '-20px', right: '-10px', zoom: 0.4 }}>
                                <span className="battery-large-charging">🔋</span>
                            </div>
                        )}
                        <label>Active Scenario</label>
                        <strong>{scenarios.find(s => s.id === selectedScenarioId)?.name || 'None'}</strong>
                        <button onClick={() => switchTab('scenarios')}>Change ↗</button>
                    </div>
                </div>
            </aside>

            {/* ── Main content area ── */}
            <div className="main-viewport">
                <div className="scroll-progress-track">
                    <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
                </div>

                <header className="content-header">
                    <div className="header-breadcrumbs">
                        <span>Digital Twin</span>
                        <span className="sep">/</span>
                        <span className="active-page">{tabConfig.find(t => t.id === tab)?.label}</span>
                    </div>

                    <div className="header-actions">
                        <div className="header-stat">
                            <span className="dot" /> <span>System Online</span>
                        </div>
                    </div>
                </header>

                <main className={`app-content-main ${transitioning ? 'tab-exit' : 'tab-enter'}`}>
                    {tab === 'hub' && (
                        <AssetOverview
                            selectedScenarioId={selectedScenarioId}
                            history={history}
                            onSwitchTab={switchTab}
                        />
                    )}
                    {tab === 'literature' && <LiteratureReview />}
                    {tab === 'offline_twin' && <OfflineTwin />}
                    {tab === 'online_twin' && (
                        <OnlineTwin />
                    )}
                    {tab === 'twin_view' && (
                        <DigitalTwinView selectedScenarioId={selectedScenarioId} />
                    )}
                    {tab === 'comparison' && (
                        <ComparisonView
                            history={history}
                        />
                    )}
                    {tab === 'scenarios' && (
                        <ScenarioSelector
                            selectedScenarioId={selectedScenarioId}
                            onSelectScenario={(id: string) => {
                                handleScenarioSelect(id);
                            }}
                        />
                    )}
                    {tab === 'info' && <InfoExplanation />}
                </main>

                <footer className="app-footer">
                    <div className="footer-content">
                        <span>Built with React + PI-LSTM Framework</span>
                    </div>
                </footer>
            </div>

            {/* ── Scroll-to-top button ── */}
            <button
                className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 15V5M10 5L5 10M10 5L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );
}
