import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { scenarios, type DataPoint, type Scenario } from '../data/scenarios';
import { mae, rmse, rSquared } from '../utils/metrics';
import VoltageChart from '../components/VoltageChart';
import { createRLS, rlsUpdate, thetaToPhysical } from '../utils/rlsEstimator';

/* ═══════════════════════════════════════════════════
   Digital Twin View — Time-Series Plots
   Measured vs Model voltage, current, SOC
   ═══════════════════════════════════════════════════ */

interface Props {
    selectedScenarioId: string;
}

function voltageToSOC(v: number): number {
    return Math.max(0, Math.min(100, (v / 2.7) * 100));
}

function MiniTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tooltip">
            <div className="tt-label">t = {Number(label).toFixed(1)} s</div>
            {payload.map((p: any) => (
                <div className="tt-row" key={p.dataKey}>
                    <span><span className="tt-dot" style={{ background: p.color }} />{p.name}</span>
                    <strong style={{ color: p.color }}>{Number(p.value).toFixed(4)}</strong>
                </div>
            ))}
        </div>
    );
}

export default function DigitalTwinView({ selectedScenarioId }: Props) {
    const scenario = useMemo(
        (): Scenario => scenarios.find((s) => s.id === selectedScenarioId) ?? scenarios[0],
        [selectedScenarioId]
    );

    /* Chart data */
    const voltageData = useMemo(() =>
        scenario.data.map((d: DataPoint) => ({
            time: d.time,
            measured: d.measuredVoltage,
            baseline: d.lstmVoltage,
            predicted: d.piLstmVoltage,
        })),
        [scenario]
    );

    const currentData = useMemo(() =>
        scenario.data.map((d: DataPoint) => ({
            time: d.time,
            current: d.current,
        })),
        [scenario]
    );

    const socData = useMemo(() =>
        scenario.data.map((d: DataPoint) => ({
            time: d.time,
            measuredSOC: voltageToSOC(d.measuredVoltage),
            modelSOC: voltageToSOC(d.piLstmVoltage),
        })),
        [scenario]
    );

    const errorData = useMemo(() =>
        scenario.data.map((d: DataPoint) => ({
            time: d.time,
            lstmError: (d.lstmVoltage - d.measuredVoltage) * 1000,
            piLstmError: (d.piLstmVoltage - d.measuredVoltage) * 1000,
        })),
        [scenario]
    );

    /* RLS Estimation Analysis (Running RLS on the chosen scenario data) */
    const rlsAnalysisData = useMemo(() => {
        let rls = createRLS(0.995, 0.9995, 0.005, 500);
        let vModel = 0.5;
        const dt = scenario.data.length > 1 ? scenario.data[1].time - scenario.data[0].time : 0.1;

        return scenario.data.map((d: DataPoint) => {
            const phi: [number, number] = [vModel, d.current];
            rls = rlsUpdate(rls, phi, d.measuredVoltage);
            const phys = thetaToPhysical(rls.theta, dt);
            vModel = rls.theta[0] * vModel + rls.theta[1] * d.current;

            return {
                time: d.time,
                estC: phys.C,
                estR: phys.R * 1000, // mOhm
            };
        });
    }, [scenario]);

    /* Metrics */
    const measured = scenario.data.map((d: DataPoint) => d.measuredVoltage);
    const lstmPred = scenario.data.map((d: DataPoint) => d.lstmVoltage);
    const piPred = scenario.data.map((d: DataPoint) => d.piLstmVoltage);

    const metricsLstm = {
        mae: mae(measured, lstmPred),
        rmse: rmse(measured, lstmPred),
        r2: rSquared(measured, lstmPred),
    };
    const metricsPi = {
        mae: mae(measured, piPred),
        rmse: rmse(measured, piPred),
        r2: rSquared(measured, piPred),
    };

    return (
        <div className="fade-in">
            {/* ── Hero ── */}
            <div className="twin-hero fade-in">
                <h2>📊 Digital Twin View — {scenario.name}</h2>
                <p>
                    Comparing measured (reference) voltage with LSTM and PI-LSTM model
                    reconstructions across the selected operating scenario.
                </p>
                <div className="twin-hero-chips">
                    <span className="param-chip">Profile: <strong style={{ color: scenario.accentColor }}>{scenario.profileType}</strong></span>
                    <span className="param-chip">Current: <strong>{scenario.currentAmplitude}</strong></span>
                    <span className="param-chip">Duration: <strong>{scenario.duration}</strong></span>
                    <span className="param-chip">Points: <strong>{scenario.data.length}</strong></span>
                </div>
            </div>

            {/* ── Model Accuracy Comparison ── */}
            <div className="metrics-compare fade-in fade-in-d1">
                <div className="glass-card metric-compare-card">
                    <div className="mc-header">
                        <span className="model-badge lstm">LSTM</span>
                    </div>
                    <div className="mc-row"><span>MAE</span><strong>{(metricsLstm.mae * 1000).toFixed(2)} <small>mV</small></strong></div>
                    <div className="mc-row"><span>RMSE</span><strong>{(metricsLstm.rmse * 1000).toFixed(2)} <small>mV</small></strong></div>
                    <div className="mc-row"><span>R²</span><strong>{metricsLstm.r2.toFixed(6)}</strong></div>
                </div>

                <div className="mc-vs">VS</div>

                <div className="glass-card metric-compare-card mc-highlight">
                    <div className="mc-header">
                        <span className="model-badge pi">PI‑LSTM</span>
                        <span className="mc-winner">★ Proposed</span>
                    </div>
                    <div className="mc-row"><span>MAE</span><strong>{(metricsPi.mae * 1000).toFixed(2)} <small>mV</small></strong></div>
                    <div className="mc-row"><span>RMSE</span><strong>{(metricsPi.rmse * 1000).toFixed(2)} <small>mV</small></strong></div>
                    <div className="mc-row"><span>R²</span><strong>{metricsPi.r2.toFixed(6)}</strong></div>
                </div>
            </div>

            {/* ── RLS Explanation Section (Highly Animated) ── */}
            <div className="glass-card fade-in rls-container" style={{ padding: '32px', marginBottom: '32px', border: '1px solid rgba(0,212,255,0.2)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
                    <div style={{ flex: '1.2', minWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div className="rls-pulse-icon">📡</div>
                            <h2 style={{ color: 'var(--cyan)', margin: 0 }}>مدلسازی آنلاین RLS (Recursive Least Squares)</h2>
                        </div>
                        <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.8', marginBottom: '20px', textAlign: 'right', direction: 'rtl' }}>
                            در حالی که مدل <strong>PI-LSTM</strong> وظیفه یادگیری رفتارهای پیچیده و غیرخطی را در حالت آفلاین دارد، الگوریتم <strong>RLS</strong> به عنوان یک ابزار قدرتمند برای **ردیابی آنلاین پارامترها** عمل می‌کند. این الگوریتم با هر پالس داده، ضرایب مدل فیزیکی ($R_s$ و $C_0$) را با استفاده از فاکتور فراموشی ($\lambda$) بروزرسانی می‌کند تا اثرات نویز و تغییرات لحظه‌ای را خنثی کند.
                        </p>

                        <div className="rls-formula-box">
                            <div className="formula-line">$V[k+1] = a \cdot V[k] + b \cdot I[k]$</div>
                            <div className="formula-arrow">⬇</div>
                            <div className="formula-res">$C = \Delta t / b \quad | \quad R = b / (1 - a)$</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                            <div className="rls-feature-tag">
                                <span className="tag-icon">⚡</span>
                                <div className="tag-text">
                                    <strong>بدون تاخیر (Zero Latency)</strong>
                                    <span>انطباق آنی با نویز حسگرها</span>
                                </div>
                            </div>
                            <div className="rls-feature-tag">
                                <span className="tag-icon">🧬</span>
                                <div className="tag-text">
                                    <strong>شناسایی فیزیکی</strong>
                                    <span>استخراج شاخص‌های سلامت دارایی</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: '1', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
                        {/* ── Custom Animated Schematic ── */}
                        <div className="rls-schematic">
                            <div className="node node-input">
                                <div className="node-label">Inputs</div>
                                <div className="data-stream">
                                    <div className="particle"></div>
                                    <div className="particle delay-1"></div>
                                    <div className="particle delay-2"></div>
                                </div>
                                <div className="signal-box">V[k], I[k]</div>
                            </div>

                            <div className="flow-line horizontal"></div>

                            <div className="node node-core">
                                <div className="core-glow"></div>
                                <div className="core-text">RLS Core</div>
                                <div className="recursive-loop"></div>
                                <div className="param-value p-c">C(t)</div>
                                <div className="param-value p-r">R(t)</div>
                            </div>

                            <div className="flow-line vertical"></div>

                            <div className="node node-output">
                                <div className="node-label">Digital Twin</div>
                                <div className="twin-inner">
                                    <div className="twin-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                    .rls-container {
                        background: linear-gradient(135deg, rgba(6, 10, 19, 0.9), rgba(12, 18, 34, 0.8));
                    }
                    .rls-pulse-icon {
                        font-size: 1.5rem;
                        animation: pulse-icon 2s infinite ease-in-out;
                    }
                    @keyframes pulse-icon {
                        0%, 100% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.2); opacity: 0.7; }
                    }
                    .rls-formula-box {
                        background: rgba(0, 212, 255, 0.05);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px dashed var(--cyan-dim);
                        text-align: center;
                        font-family: 'JetBrains Mono', monospace;
                    }
                    .formula-line { color: var(--cyan); font-weight: bold; font-size: 1.1rem; }
                    .formula-arrow { color: var(--text-muted); margin: 5px 0; }
                    .formula-res { color: var(--amber); font-weight: bold; }

                    .rls-feature-tag {
                        display: flex;
                        gap: 12px;
                        padding: 12px;
                        background: rgba(255,255,255,0.03);
                        border-radius: 8px;
                        border: 1px solid var(--border);
                    }
                    .tag-icon { font-size: 1.2rem; }
                    .tag-text { display: flex; flex-direction: column; gap: 2px; }
                    .tag-text strong { font-size: 0.85rem; color: var(--text-primary); }
                    .tag-text span { font-size: 0.75rem; color: var(--text-muted); }

                    /* Schematic Styles */
                    .rls-schematic {
                        position: relative;
                        width: 300px;
                        height: 300px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                    }
                    .node {
                        width: 80px;
                        height: 80px;
                        border-radius: 16px;
                        background: var(--bg-surface);
                        border: 2px solid var(--border);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        z-index: 5;
                    }
                    .node-label {
                        position: absolute;
                        top: -25px;
                        font-size: 0.7rem;
                        text-transform: uppercase;
                        color: var(--text-muted);
                        letter-spacing: 1px;
                    }
                    .signal-box { font-size: 0.75rem; color: var(--cyan); font-weight: bold; }
                    
                    .node-core {
                        width: 100px;
                        height: 100px;
                        border-color: var(--cyan);
                        background: rgba(0, 212, 255, 0.1);
                        box-shadow: 0 0 20px var(--cyan-dim);
                    }
                    .core-text { font-size: 0.8rem; font-weight: bold; color: white; }
                    .core-glow {
                        position: absolute;
                        inset: -5px;
                        border-radius: 20px;
                        background: var(--cyan);
                        filter: blur(15px);
                        opacity: 0.2;
                        animation: core-breathing 3s infinite ease-in-out;
                    }
                    @keyframes core-breathing {
                        0%, 100% { opacity: 0.1; transform: scale(1); }
                        50% { opacity: 0.3; transform: scale(1.1); }
                    }

                    .recursive-loop {
                        position: absolute;
                        width: 120px;
                        height: 120px;
                        border: 2px solid transparent;
                        border-top-color: var(--cyan);
                        border-radius: 50%;
                        animation: spin 3s linear infinite;
                    }
                    @keyframes spin { 100% { transform: rotate(360deg); } }

                    .param-value {
                        position: absolute;
                        padding: 4px 8px;
                        background: var(--bg-base);
                        border: 1px solid var(--border);
                        border-radius: 4px;
                        font-size: 0.65rem;
                        font-weight: bold;
                    }
                    .p-c { right: -40px; top: 10px; color: var(--cyan); border-color: var(--cyan-dim); }
                    .p-r { right: -40px; bottom: 10px; color: var(--amber); border-color: var(--amber-dim); }

                    .node-output {
                        margin-top: 40px;
                        border-color: var(--emerald);
                    }
                    .twin-inner {
                        width: 30px;
                        height: 30px;
                        background: var(--emerald-dim);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .twin-pulse {
                        width: 15px;
                        height: 15px;
                        background: var(--emerald);
                        border-radius: 50%;
                        animation: twin-pulse 1.5s infinite;
                    }
                    @keyframes twin-pulse {
                        0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                        70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                        100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                    }

                    .flow-line {
                        background: var(--border);
                        position: relative;
                    }
                    .flow-line.horizontal { width: 40px; height: 2px; }
                    .flow-line.vertical { width: 2px; height: 40px; }

                    .data-stream {
                        position: absolute;
                        left: -50px;
                        top: 50%;
                        width: 50px;
                        height: 2px;
                    }
                    .particle {
                        position: absolute;
                        width: 4px;
                        height: 4px;
                        background: var(--cyan);
                        border-radius: 50%;
                        left: 0;
                        top: -1px;
                        animation: particle-flow 2s linear infinite;
                    }
                    .delay-1 { animation-delay: 0.6s; }
                    .delay-2 { animation-delay: 1.2s; }
                    @keyframes particle-flow {
                        0% { left: 0; opacity: 0; }
                        20% { opacity: 1; }
                        80% { opacity: 1; }
                        100% { left: 40px; opacity: 0; }
                    }
                `}</style>
            </div>

            {/* ── Voltage Chart ── */}
            <div className="glass-card chart-section fade-in fade-in-d2">
                <h2>Voltage Reconstruction Comparison</h2>
                <p className="chart-sub">
                    Solid: measurement &nbsp;|&nbsp; Long-dash: LSTM &nbsp;|&nbsp; Short-dash: PI-LSTM
                </p>
                <VoltageChart
                    data={voltageData}
                    measuredColor={scenario.accentColor}
                    baselineColor="#a78bfa"
                    predictedColor="#f43f5e"
                    measuredLabel="Measured"
                    baselineLabel="LSTM"
                    predictedLabel="PI‑LSTM"
                />
            </div>

            {/* ── RLS Parameter Convergence (New) ── */}
            <div className="glass-card chart-section fade-in fade-in-d2" style={{ borderTop: '2px solid var(--cyan-dim)' }}>
                <h2>RLS Online Parameter Convergence Analysis</h2>
                <p className="chart-sub">Tracking physical Resistance (mΩ) and Capacitance (F) from scenario data</p>
                <div className="twin-charts-row">
                    <div className="chart-wrapper" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={rlsAnalysisData} margin={{ top: 8, right: 24, bottom: 24, left: 12 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--cyan)' }} label={{ value: 'Capacitance (F)', angle: -90, position: 'insideLeft', style: { fill: 'var(--cyan)' } }} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--amber)' }} label={{ value: 'Resistance (mΩ)', angle: 90, position: 'insideRight', style: { fill: 'var(--amber)' } }} />
                                <Tooltip content={<MiniTooltip />} />
                                <Line yAxisId="left" type="monotone" dataKey="estC" name="Est. Capacitance" stroke="var(--cyan)" strokeWidth={2} dot={false} />
                                <Line yAxisId="right" type="monotone" dataKey="estR" name="Est. Resistance" stroke="var(--amber)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="chart-legend" style={{ justifyContent: 'center' }}>
                    <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--cyan)' }} />Capacitance (F)</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--amber)' }} />Resistance (mΩ)</span>
                </div>
            </div>

            {/* ── Current & SOC side by side ── */}
            <div className="twin-charts-row fade-in fade-in-d3">
                {/* Current */}
                <div className="glass-card chart-section">
                    <h2>Current Profile</h2>
                    <p className="chart-sub">Applied excitation current — {scenario.currentAmplitude}</p>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={currentData} margin={{ top: 8, right: 24, bottom: 24, left: 12 }}>
                                <defs>
                                    <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={scenario.accentColor} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={scenario.accentColor} stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" tick={{ fontSize: 11 }} label={{ value: 'Time (s)', position: 'insideBottom', offset: -14, style: { fill: '#64748b', fontSize: 11 } }} />
                                <YAxis tick={{ fontSize: 11 }} label={{ value: 'Current (A)', angle: -90, position: 'insideLeft', offset: 4, style: { fill: '#64748b', fontSize: 11 } }} />
                                <Tooltip content={<MiniTooltip />} />
                                <Area type="monotone" dataKey="current" name="Current" stroke={scenario.accentColor} fill="url(#currentGrad)" strokeWidth={2} dot={false} isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* SOC */}
                <div className="glass-card chart-section">
                    <h2>State of Charge (SOC)</h2>
                    <p className="chart-sub">Derived from voltage — measured vs PI-LSTM model</p>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={socData} margin={{ top: 8, right: 24, bottom: 24, left: 12 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" tick={{ fontSize: 11 }} label={{ value: 'Time (s)', position: 'insideBottom', offset: -14, style: { fill: '#64748b', fontSize: 11 } }} />
                                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} label={{ value: 'SOC (%)', angle: -90, position: 'insideLeft', offset: 4, style: { fill: '#64748b', fontSize: 11 } }} />
                                <Tooltip content={<MiniTooltip />} />
                                <Line type="monotone" dataKey="measuredSOC" name="Measured SOC" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                                <Line type="monotone" dataKey="modelSOC" name="PI-LSTM SOC" stroke="#f43f5e" strokeWidth={2} strokeDasharray="6 3" dot={false} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Prediction Error ── */}
            <div className="glass-card chart-section fade-in fade-in-d4">
                <h2>Prediction Error Analysis</h2>
                <p className="chart-sub">
                    Voltage prediction error (model − measured) in millivolts
                </p>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={errorData} margin={{ top: 8, right: 24, bottom: 24, left: 12 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" tick={{ fontSize: 11 }} label={{ value: 'Time (s)', position: 'insideBottom', offset: -14, style: { fill: '#64748b', fontSize: 11 } }} />
                            <YAxis tick={{ fontSize: 11 }} label={{ value: 'Error (mV)', angle: -90, position: 'insideLeft', offset: 4, style: { fill: '#64748b', fontSize: 11 } }} />
                            <Tooltip content={<MiniTooltip />} />
                            <Line type="monotone" dataKey="lstmError" name="LSTM Error" stroke="#a78bfa" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                            <Line type="monotone" dataKey="piLstmError" name="PI-LSTM Error" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-legend">
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#a78bfa' }} />LSTM Error</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#f43f5e' }} />PI-LSTM Error</span>
                </div>
            </div>
        </div>
    );
}
