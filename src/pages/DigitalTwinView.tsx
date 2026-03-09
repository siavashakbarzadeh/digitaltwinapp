import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { type DataPoint, type Scenario } from '../data/scenarios';
import { mae, rmse, rSquared } from '../utils/metrics';
import VoltageChart from '../components/VoltageChart';
import { createRLS, rlsUpdate } from '../utils/rlsEstimator';
import { useSimulation } from '../context/SimulationContext';
import AnimatedSuperCap from '../components/AnimatedSuperCap';

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
    const { scenarios } = useSimulation();
    const scenario = useMemo(
        (): Scenario => scenarios.find((s) => s.id === selectedScenarioId) ?? scenarios[0],
        [selectedScenarioId, scenarios]
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
        // Initial guess [Rs, C0, K]
        let rls = createRLS(0.995, [0.00022, 3000, 20], 500);
        let v_c = 0.5;
        const dt = scenario.data.length > 1 ? scenario.data[1].time - scenario.data[0].time : 0.1;

        return scenario.data.map((d: DataPoint) => {
            // Regressor: [i, i*dt/(v_c), |v_c|*i*dt]
            const phi = [d.current, (d.current * dt) / (v_c || 0.1), Math.abs(v_c) * (d.current * dt)];
            rls = rlsUpdate(rls, phi, d.measuredVoltage);

            const rs_est = rls.theta[0];
            const c0_est = rls.theta[1];
            const k_est = rls.theta[2];

            // Internal voltage update: v_c[k+1] = v_c[k] + (i*dt)/(c0 + k*|v_c|)
            const c_eff = Math.max(10, c0_est + k_est * Math.abs(v_c));
            v_c = v_c + (d.current * dt) / c_eff;

            return {
                time: d.time,
                estC: c0_est,
                estR: rs_est * 1000, // mOhm
                estK: k_est
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
                            <h2 style={{ color: 'var(--cyan)', margin: 0 }}>Online RLS (Recursive Least Squares) Modeling</h2>
                        </div>
                        <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.8', marginBottom: '20px' }}>
                            While the <strong>PI-LSTM</strong> model learns complex non-linear behaviors offline, the <strong>RLS</strong> algorithm serves as a robust tool for <strong>online parameter tracking</strong>.
                            It updates physical parameters ($R_s$ and $C_0$) at each measurement step using a forgetting factor ($\lambda$), ensuring the digital twin adapts to sensor noise and transient shifts.
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
                                    <strong>Zero Latency</strong>
                                    <span>Instant adaptation to sensor noise</span>
                                </div>
                            </div>
                            <div className="rls-feature-tag">
                                <span className="tag-icon">🧬</span>
                                <div className="tag-text">
                                    <strong>Physical Identification</strong>
                                    <span>Extracts real-time SOH indicators</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <AnimatedSuperCap
                            voltage={scenario.data[scenario.data.length - 1]?.measuredVoltage || 0.5}
                            charging={scenario.data[scenario.data.length - 1]?.current > 0}
                            color={scenario.accentColor}
                            size={120}
                        />
                        <div className="rls-badge-online">LIVE TRACKING ACTIVE</div>
                    </div>
                </div>

                <style>{`
                    .rls-badge-online {
                        padding: 6px 16px;
                        background: rgba(16, 185, 129, 0.1);
                        color: var(--emerald);
                        border: 1px solid var(--emerald-dim);
                        border-radius: 20px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.7rem;
                        font-weight: 800;
                        letter-spacing: 1px;
                        animation: rls-pulse-badge 2s infinite;
                    }
                    @keyframes rls-pulse-badge {
                        0%, 100% { opacity: 0.7; box-shadow: 0 0 5px var(--emerald-dim); }
                        50% { opacity: 1; box-shadow: 0 0 15px var(--emerald-dim); }
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
