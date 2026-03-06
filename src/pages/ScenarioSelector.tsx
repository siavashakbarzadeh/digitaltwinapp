import React from 'react';
import { scenarios } from '../data/scenarios';
import type { Scenario } from '../data/scenarios';

/* ═══════════════════════════════════════════════════
   Scenario Selector — Choose operating scenarios
   ═══════════════════════════════════════════════════ */

interface Props {
    selectedScenarioId: string;
    onSelectScenario: (id: string) => void;
}

function ScenarioDetailCard({ scenario }: { scenario: Scenario }) {
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
    const selectedScenario = scenarios.find(s => s.id === selectedScenarioId) ?? scenarios[0];

    return (
        <div className="fade-in">
            {/* Hero */}
            <div className="scenario-hero fade-in">
                <h2>⚡ Scenario Selector</h2>
                <p>
                    Choose an operating scenario to update the dashboard KPIs and digital twin plots.
                    Each scenario represents a different load profile applied to the virtual supercapacitor asset.
                </p>
            </div>

            {/* Scenario cards */}
            <div className="scenario-select-grid fade-in fade-in-d1">
                {scenarios.map((s) => (
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
