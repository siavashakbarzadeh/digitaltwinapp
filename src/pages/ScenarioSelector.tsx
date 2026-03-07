import React, { useState } from 'react';
import { scenarios as initialScenarios, buildScenario } from '../data/scenarios';
import type { Scenario } from '../data/scenarios';

/* ═══════════════════════════════════════════════════
   Scenario Selector — Choose operating scenarios
   ═══════════════════════════════════════════════════ */

interface Props {
    selectedScenarioId: string;
    onSelectScenario: (id: string) => void;
}

function ScenarioDetailCard({ scenario }: { scenario: Scenario }) {
    if (!scenario) return null;
    const voltages = scenario.data.map(d => d.measuredVoltage);
    const currents = scenario.data.map(d => d.current);
    const maxV = Math.max(...voltages).toFixed(3);
    const minV = Math.min(...voltages).toFixed(3);
    const maxI = Math.max(...currents).toFixed(0);
    const minI = Math.min(...currents).toFixed(0);
    const avgPower = (scenario.data.reduce((s, d) => s + d.measuredVoltage * d.current, 0) / scenario.data.length).toFixed(1);

    return (
        <div className="scenario-detail glass-card fade-in">
            <h2>📋 Scenario Details — {scenario.name}</h2>
            <p className="scenario-detail-desc">{scenario.description}</p>

            <div className="scenario-detail-grid">
                <div className="sd-item">
                    <span className="sd-label">Profile Type</span>
                    <span className="sd-value" style={{ color: scenario.accentColor }}>{scenario.profileType}</span>
                </div>
                <div className="sd-item">
                    <span className="sd-label">Current Amplitude</span>
                    <span className="sd-value">{scenario.currentAmplitude}</span>
                </div>
                <div className="sd-item">
                    <span className="sd-label">Duration</span>
                    <span className="sd-value">{scenario.duration}</span>
                </div>
                <div className="sd-item">
                    <span className="sd-label">Data Points</span>
                    <span className="sd-value">{scenario.data.length}</span>
                </div>
                <div className="sd-item">
                    <span className="sd-label">Voltage Range</span>
                    <span className="sd-value">{minV} – {maxV} V</span>
                </div>
                <div className="sd-item">
                    <span className="sd-label">Current Range</span>
                    <span className="sd-value">{minI} – {maxI} A</span>
                </div>
                <div className="sd-item">
                    <span className="sd-label">Avg. Power</span>
                    <span className="sd-value">{avgPower} W</span>
                </div>
                <div className="sd-item">
                    <span className="sd-label">Sampling</span>
                    <span className="sd-value">{(scenario.data[1]?.time - scenario.data[0]?.time).toFixed(1)}s</span>
                </div>
            </div>

            {/* Mini preview sparkline */}
            <div className="scenario-preview">
                <div className="sp-chart">
                    <span className="sp-label">Voltage</span>
                    <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="sp-svg">
                        <polyline
                            fill="none"
                            stroke={scenario.accentColor}
                            strokeWidth="1"
                            points={scenario.data.filter((_, i) => i % 3 === 0).map((d, i, arr) => {
                                const minScale = scenario.assetType === 'supercapacitor' ? 0 : 3.0;
                                const maxScale = scenario.assetType === 'supercapacitor' ? 3.0 : 4.5;
                                return `${(i / (arr.length - 1)) * 200},${40 - ((d.measuredVoltage - minScale) / (maxScale - minScale)) * 38}`;
                            }).join(' ')}
                        />
                    </svg>
                </div>
                <div className="sp-chart">
                    <span className="sp-label">Current</span>
                    <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="sp-svg">
                        <polyline
                            fill="none"
                            stroke="var(--amber)"
                            strokeWidth="1"
                            points={scenario.data.filter((_, i) => i % 3 === 0).map((d, i, arr) =>
                                `${(i / (arr.length - 1)) * 200},${20 - (d.current / 200) * 18}`
                            ).join(' ')}
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}

export default function ScenarioSelector({ selectedScenarioId, onSelectScenario }: Props) {
    const [scenarioList, setScenarioList] = useState<Scenario[]>(initialScenarios);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newScenario, setNewScenario] = useState({
        name: 'New Custom Scenario',
        description: 'User-defined load profile.',
        profileType: 'User Defined',
        current: 50,
        duration: 60,
        color: '#f43f5e'
    });

    const selectedScenario = scenarioList.find(s => s.id === selectedScenarioId) ?? scenarioList[0];

    const handleAddScenario = () => {
        const id = `custom-${Date.now()}`;
        // Simple constant phase current function for custom scenarios
        const currentFn = (t: number) => {
            const phase = t % newScenario.duration;
            return phase < newScenario.duration * 0.7 ? newScenario.current : -newScenario.current / 2;
        };

        const added = buildScenario(
            id,
            newScenario.name,
            newScenario.description,
            newScenario.profileType,
            `${newScenario.current} A`,
            newScenario.color,
            currentFn,
            newScenario.duration,
            0.5,
            0.5,
            'supercapacitor',
            'new'
        );

        setScenarioList([...scenarioList, added]);
        setShowAddForm(false);
        onSelectScenario(id);
    };

    return (
        <div className="fade-in">
            {/* Hero */}
            <div className="scenario-hero fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>⚡ Scenario Selector</h2>
                    <p>Choose an operating scenario or create a custom profile to update the digital twin projections.</p>
                </div>
                <button
                    className="add-scenario-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        background: 'linear-gradient(to right, var(--emerald), var(--cyan))',
                        color: 'white',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
                    }}
                >
                    {showAddForm ? '✕ Close Form' : '+ Add New Scenario'}
                </button>
            </div>

            {/* Add Form (Expandable) */}
            {showAddForm && (
                <div className="glass-card fade-in" style={{ marginBottom: '32px', padding: '32px', border: '1px solid var(--emerald)' }}>
                    <h3 style={{ marginBottom: '24px' }}>🛠️ Configure Custom Profile</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Scenario Name</label>
                            <input
                                type="text"
                                value={newScenario.name}
                                onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Current Amp (A)</label>
                            <input
                                type="number"
                                value={newScenario.current}
                                onChange={(e) => setNewScenario({ ...newScenario, current: Number(e.target.value) })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Duration (s)</label>
                            <input
                                type="number"
                                value={newScenario.duration}
                                onChange={(e) => setNewScenario({ ...newScenario, duration: Number(e.target.value) })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Theme Color</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['#f43f5e', '#a78bfa', '#00d4ff', '#10b981', '#f59e0b'].map(c => (
                                    <div
                                        key={c}
                                        onClick={() => setNewScenario({ ...newScenario, color: c })}
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, border: newScenario.color === c ? '2px solid white' : 'none', cursor: 'pointer' }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleAddScenario}
                        style={{ marginTop: '24px', padding: '12px 30px', borderRadius: '8px', background: 'var(--emerald)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Generate Phase Profile & Add
                    </button>
                </div>
            )}

            {/* Scenario cards */}
            <div className="scenario-select-grid fade-in fade-in-d1">
                {scenarioList.map((s) => (
                    <div
                        key={s.id}
                        className={`glass-card scenario-select-card ${s.id === selectedScenarioId ? 'selected' : ''}`}
                        style={{ '--card-accent': s.accentColor } as React.CSSProperties}
                        onClick={() => onSelectScenario(s.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onSelectScenario(s.id)}
                    >
                        <div className="ssc-top">
                            <span className="card-badge">{s.profileType}</span>
                            {s.id === selectedScenarioId && (
                                <span className="ssc-active">✓ Active</span>
                            )}
                        </div>
                        <h3>{s.name}</h3>
                        <p>{s.description}</p>

                        {/* Mini sparkline */}
                        <div className="ssc-sparkline">
                            <svg viewBox="0 0 120 28" preserveAspectRatio="none">
                                <polyline
                                    fill="none"
                                    stroke={s.accentColor}
                                    strokeWidth="1.2"
                                    strokeOpacity={0.8}
                                    points={s.data.filter((_, i) => i % 5 === 0).map((d, i, arr) => {
                                        const minScale = s.assetType === 'supercapacitor' ? 0 : 3.0;
                                        const maxScale = s.assetType === 'supercapacitor' ? 3.0 : 4.5;
                                        return `${(i / (arr.length - 1)) * 120},${28 - ((d.measuredVoltage - minScale) / (maxScale - minScale)) * 26}`;
                                    }).join(' ')}
                                />
                            </svg>
                        </div>

                        <div className="card-footer">
                            <span>⚡ {s.currentAmplitude}</span>
                            <span>⏱ {s.duration}</span>
                            <span>📐 {s.data.length} pts</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Selected scenario detail */}
            <ScenarioDetailCard scenario={selectedScenario} />
        </div>
    );
}
