import InfoExplanation from './pages/InfoExplanation';
import ComparisonView from './pages/ComparisonView';
import { scenarios, Scenario, AssetType, DeviceCondition } from './data/scenarios';
import { useState, useEffect, useCallback } from 'react';
import { mae, rmse } from './utils/metrics';

type Tab = 'overview' | 'twin' | 'comparison' | 'scenarios' | 'info';

export interface HistoryEntry {
    id: string;
    timestamp: string;
    assetType: AssetType;
    scenarioName: string;
    condition: DeviceCondition;
    mae: number;
    rmse: number;
    soh: number;
}

export default function App() {
    const [tab, setTab] = useState<Tab>('overview');
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
            if (e.key === '1') switchTab('overview');
            else if (e.key === '2') switchTab('twin');
            else if (e.key === '3') switchTab('comparison');
            else if (e.key === '4') switchTab('scenarios');
            else if (e.key === '5') switchTab('info');
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
        { id: 'overview' as Tab, icon: '🏠', label: 'Dashboard', shortcut: '1' },
        { id: 'twin' as Tab, icon: '📊', label: 'Twin View', shortcut: '2' },
        { id: 'comparison' as Tab, icon: '⚖️', label: 'Compare', shortcut: '3' },
        { id: 'scenarios' as Tab, icon: '⚡', label: 'Scenarios', shortcut: '4' },
        { id: 'info' as Tab, icon: '📖', label: 'About', shortcut: '5' },
    ];

    return (
        <div className="app">
            {/* ── Scroll progress bar ── */}
            <div className="scroll-progress-track">
                <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
            </div>

            {/* ── Header ── */}
            <header className="app-header">
                <div className="header-particles">
                    <span /><span /><span /><span /><span /><span /><span /><span />
                </div>
                <div className="header-content">
                    <div className="logo">
                        <div className="logo-icon">⚡</div>
                        <div>
                            <h1>Supercapacitor Digital Twin</h1>
                            <p className="subtitle">Energy Dashboard · PhD Research Demo</p>
                        </div>
                    </div>

                    <nav className="tab-nav">
                        {tabConfig.map((t) => (
                            <button
                                key={t.id}
                                id={`tab-${t.id}`}
                                className={`tab-btn ${tab === t.id ? 'active' : ''}`}
                                onClick={() => switchTab(t.id)}
                                title={`Press ${t.shortcut}`}
                            >
                                <span className="tab-icon">{t.icon}</span>
                                {t.label}
                                <span className="tab-shortcut">{t.shortcut}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* ── Scenario indicator strip ── */}
                <div className="scenario-strip">
                    <span className="ss-label">Active Scenario:</span>
                    <span className="ss-value">{
                        selectedScenarioId === '90a' ? '90 A Evaluation Profile' :
                            selectedScenarioId === '20a' ? '20 A Low-Current (Simulink)' :
                                selectedScenarioId === '60a' ? '60 A Medium-Transient (Simulink)' :
                                    '140 A High-Current Stress (Simulink)'
                    }</span>
                    <button
                        className="ss-change-btn"
                        onClick={() => switchTab('scenarios')}
                    >
                        Change ↗
                    </button>
                </div>
            </header>

            {/* ── Content ── */}
            <main className={`app-main ${transitioning ? 'tab-exit' : 'tab-enter'}`}>
                {tab === 'overview' && (
                    <AssetOverview
                        selectedScenarioId={selectedScenarioId}
                        history={history}
                    />
                )}
                {tab === 'twin' && (
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
                        onSelectScenario={(id) => {
                            handleScenarioSelect(id);
                        }}
                    />
                )}
                {tab === 'info' && <InfoExplanation />}
            </main>

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

            {/* ── Footer ── */}
            <footer className="app-footer">
                <div className="footer-glow" />
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="footer-logo">⚡</span>
                        <div>
                            <div className="footer-title">Supercapacitor Digital Twin Platform</div>
                            <div className="footer-sub">PhD Research Demo · Physics-Informed LSTM + RC Model</div>
                        </div>
                    </div>

                    <div className="footer-stats">
                        <div className="footer-stat">
                            <span className="footer-stat-icon">🔬</span>
                            <span className="footer-stat-val">4</span>
                            <span className="footer-stat-label">Scenarios</span>
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
                        <div className="footer-stat">
                            <span className="footer-stat-icon">📊</span>
                            <span className="footer-stat-val">R²≈1</span>
                            <span className="footer-stat-label">Accuracy</span>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <span>Built with React + TypeScript + Recharts</span>
                        <span className="footer-separator">·</span>
                        <span>Keyboard shortcuts: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> <kbd>5</kbd></span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
