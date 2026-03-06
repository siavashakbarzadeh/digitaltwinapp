import { useState, useEffect, useMemo } from 'react';
import { AssetType, DeviceCondition, scenarios, ASSET_PARAMS } from '../data/scenarios';
import { HistoryEntry } from '../types';

/* ═══════════════════════════════════════════════════
   Home / Asset Overview — KPI Dashboard
   ═══════════════════════════════════════════════════ */

interface Props {
    selectedScenarioId: string;
    history: HistoryEntry[];
}

function AnimatedNumber({ value, suffix = "", decimals = 1 }: { value: number, suffix?: string, decimals?: number }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const start = display;
        const end = value;
        const duration = 800;
        let startTime: number;

        const animate = (now: number) => {
            if (!startTime) startTime = now;
            const progress = Math.min((now - startTime) / duration, 1);
            const current = start + (end - start) * progress;
            setDisplay(current);
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [value]);

    return <span>{display.toFixed(decimals)}{suffix}</span>;
}

export default function AssetOverview({ selectedScenarioId, history }: Props) {
    const scenario = useMemo(() => scenarios.find(s => s.id === selectedScenarioId) || scenarios[0], [selectedScenarioId]);

    // Derived values (mocked for demo)
    const voltage = scenario.data[scenario.data.length - 1]?.measuredVoltage || 0;
    const current = scenario.data[scenario.data.length - 1]?.current || 0;
    const power = Math.abs(voltage * current);
    const soc = (voltage / (scenario.assetType === 'supercapacitor' ? 2.7 : 4.2)) * 100;

    const params = ASSET_PARAMS[scenario.assetType as AssetType][scenario.condition as DeviceCondition];

    return (
        <div className="fade-in">
            {/* ── Hero Info ── */}
            <div className="dashboard-hero glass-card">
                <div className="hero-badge">
                    {scenario.assetType === 'supercapacitor' ? '⚡ Supercapacitor Mode' : '🔋 Battery Pack Mode'}
                    <span className="badge-sep">|</span>
                    {scenario.condition === 'new' ? '✨ Condition: New' : '⚠️ Condition: Aged'}
                </div>
                <h1>{scenario.name}</h1>
                <p>{scenario.description}</p>
            </div>

            {/* ── KPI Grid ── */}
            <div className="kpi-grid">
                <div className="kpi-card glass-card">
                    <div className="kpi-icon">⚡</div>
                    <div className="kpi-content">
                        <label>Terminal Voltage</label>
                        <h3><AnimatedNumber value={voltage} suffix=" V" decimals={3} /></h3>
                    </div>
                </div>

                <div className="kpi-card glass-card">
                    <div className="kpi-icon">🔄</div>
                    <div className="kpi-content">
                        <label>Line Current</label>
                        <h3><AnimatedNumber value={current} suffix=" A" decimals={1} /></h3>
                    </div>
                </div>

                <div className="kpi-card glass-card">
                    <div className="kpi-icon">🔥</div>
                    <div className="kpi-content">
                        <label>Active Power</label>
                        <h3><AnimatedNumber value={power / 1000} suffix=" kW" decimals={2} /></h3>
                    </div>
                </div>

                <div className="kpi-card glass-card">
                    <div className="kpi-icon">❤️</div>
                    <div className="kpi-content">
                        <label>State of Health (SOH)</label>
                        <h3><AnimatedNumber value={scenario.soh} suffix="%" /></h3>
                        <div className="soh-bar-container">
                            <div className="soh-bar-fill" style={{ width: `${scenario.soh}%`, background: scenario.soh > 90 ? '#10b981' : '#f59e0b' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-main-strip">
                {/* ── SOC Gauge ── */}
                <div className="glass-card soc-section">
                    <h3>State of Charge (SOC)</h3>
                    <div className="soc-gauge-large">
                        <div className="gauge-background"></div>
                        <div className="gauge-fill" style={{ transform: `rotate(${(soc / 100) * 180 - 180}deg)` }}></div>
                        <div className="gauge-center">
                            <h2>{soc.toFixed(1)}%</h2>
                        </div>
                    </div>
                </div>

                {/* ── History Log ── */}
                <div className="glass-card history-section">
                    <div className="history-header">
                        <h3>📋 Session History</h3>
                        <span className="history-count">{history.length} snapshots</span>
                    </div>
                    {history.length > 0 ? (
                        <div className="history-list">
                            {history.map((h, i) => (
                                <div key={h.id} className="history-item">
                                    <div className="history-time">{h.timestamp}</div>
                                    <div className="history-meta">
                                        <strong>{h.scenarioName}</strong>
                                        <span>{h.assetType === 'battery' ? '🔋' : '⚡'} {h.condition}</span>
                                    </div>
                                    <div className="history-score">
                                        MAE: <strong>{(h.mae * 1000).toFixed(1)} mV</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="history-empty">
                            <p>No snapshots yet. Select a scenario to begin monitoring.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="asset-specs glass-card">
                <h3>🛠️ Virtual Asset Specifications</h3>
                <div className="spec-grid">
                    <div className="spec-item"><label>Asset Type</label><span>{scenario.assetType}</span></div>
                    <div className="spec-item"><label>Base Resistance (Rs)</label><span>{(params.Rs * 1000).toFixed(3)} mΩ</span></div>
                    <div className="spec-item"><label>Capacitance (C0)</label><span>{params.C0.toLocaleString()} F</span></div>
                    <div className="spec-item"><label>Voltage Limit</label><span>{scenario.assetType === 'supercapacitor' ? '2.7V' : '4.2V'}</span></div>
                </div>
            </div>
        </div>
    );
}
