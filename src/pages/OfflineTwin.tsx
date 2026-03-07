import React from 'react';
import { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import {
    scenarios, LSTM_PARAMS, PILSTM_PARAMS, TRUE_PARAMS,
    paperMetrics, trainingEfficiency,
    lstmLossData, piLstmLossData,
    lstmTimeData, piLstmTimeData,
} from '../data/scenarios';
import type { Scenario } from '../data/scenarios';
import { mae, rmse, rSquared } from '../utils/metrics';
import VoltageChart from '../components/VoltageChart';

/* ── tiny inline tooltip for the loss / bar charts ── */
function MiniTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tooltip">
            <div className="tt-label">Epoch {label}</div>
            {payload.map((p: any) => (
                <div className="tt-row" key={p.dataKey}>
                    <span><span className="tt-dot" style={{ background: p.color }} />{p.name}</span>
                    <strong style={{ color: p.color }}>{Number(p.value).toFixed(5)}</strong>
                </div>
            ))}
        </div>
    );
}

/* ── Scenario card (local, since interface changed) ── */
function ProfileCard({ s, selected, onClick }: { s: Scenario; selected: boolean; onClick: () => void }) {
    return (
        <div
            className={`glass-card scenario-card ${selected ? 'selected' : ''}`}
            style={{ '--card-accent': s.accentColor } as React.CSSProperties}
            onClick={onClick} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
        >
            <span className="card-badge">{s.profileType}</span>
            <h3>{s.name}</h3>
            <p>{s.description}</p>
            <div className="card-footer">
                <span>⚡ {s.currentAmplitude}</span>
                <span>⏱ {s.duration}</span>
                <span>📐 {s.data.length} pts</span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════ */

export default function OfflineTwin() {
    const [selectedId, setSelectedId] = useState(scenarios[0].id);

    const scenario = useMemo(() => scenarios.find((s) => s.id === selectedId)!, [selectedId]);

    /* ── Compute metrics for both models ── */
    const measured = scenario.data.map((d) => d.measuredVoltage);
    const lstmPred = scenario.data.map((d) => d.lstmVoltage);
    const piPred = scenario.data.map((d) => d.piLstmVoltage);

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

    /* ── Chart data with all three traces ── */
    const chartData = useMemo(() =>
        scenario.data.map((d) => ({
            time: d.time,
            measured: d.measuredVoltage,
            baseline: d.lstmVoltage,
            predicted: d.piLstmVoltage,
        })),
        [scenario]);

    /* ── efficiency bar data ── */
    const effBars = [
        { name: 'LSTM', time: trainingEfficiency.lstm.avgTime, fill: '#a78bfa' },
        { name: 'PI‑LSTM', time: trainingEfficiency.piLstm.avgTime, fill: '#10b981' },
    ];

    return (
        <div className="fade-in">
            {/* ── Hero Banner ── */}
            <div className="offline-hero-banner fade-in">
                <h2>📊 Offline Parameters — PI‑LSTM Framework</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 560, lineHeight: 1.6 }}>
                    Physics-Informed LSTM framework for discrete-time supercapacitor voltage modelling.
                    Combines equivalent-circuit interpretability with LSTM sequence learning, avoiding
                    PINN training instabilities and continuous-time differentiation overhead.
                </p>
                <div className="equation-highlight" style={{ marginTop: 12 }}>
                    ℒ = ℒ<sub>data</sub> + λ · ℒ<sub>physics</sub> &nbsp;&nbsp;|&nbsp;&nbsp; V̂[k+1] = f<sub>LSTM</sub>(x[k]) &nbsp;&nbsp;|&nbsp;&nbsp; RC residual penalty
                </div>
            </div>

            {/* ── Animated Stats ── */}
            <div className="anim-stats-row fade-in fade-in-d1">
                <div className="anim-stat-card" style={{ '--card-color': 'var(--cyan)' } as React.CSSProperties}>
                    <span className="anim-stat-icon">🧬</span>
                    <span className="anim-stat-value" style={{ color: 'var(--cyan)' }}>3</span>
                    <span className="anim-stat-label">Pipeline Stages</span>
                </div>
                <div className="anim-stat-card" style={{ '--card-color': 'var(--violet)' } as React.CSSProperties}>
                    <span className="anim-stat-icon">🧠</span>
                    <span className="anim-stat-value" style={{ color: 'var(--violet)' }}>PI-LSTM</span>
                    <span className="anim-stat-label">Architecture</span>
                </div>
                <div className="anim-stat-card" style={{ '--card-color': 'var(--emerald)' } as React.CSSProperties}>
                    <span className="anim-stat-icon">📈</span>
                    <span className="anim-stat-value" style={{ color: 'var(--emerald)' }}>R²≈1</span>
                    <span className="anim-stat-label">Accuracy</span>
                </div>
                <div className="anim-stat-card" style={{ '--card-color': 'var(--amber)' } as React.CSSProperties}>
                    <span className="anim-stat-icon">⚡</span>
                    <span className="anim-stat-value" style={{ color: 'var(--amber)' }}>5</span>
                    <span className="anim-stat-label">Test Scenarios</span>
                </div>
            </div>

            {/* ════════ 2. ARCHITECTURE WORKFLOW ════════ */}
            <div className="glass-card chart-section fade-in fade-in-d1">
                <h2>Reference Architecture — Three-Stage Offline Workflow</h2>
                <p className="chart-sub">
                    §3.1 — RC parameter identification → Baseline LSTM → Physics-informed fine-tuning
                </p>

                <div className="arch-flow">
                    <div className="arch-stage">
                        <div className="arch-icon" style={{ background: 'var(--cyan-dim)', borderColor: 'rgba(0,212,255,.25)' }}>🧬</div>
                        <h4>Stage 1</h4>
                        <strong>RC Parameter ID</strong>
                        <p>Differential Evolution optimises
                            θ = [R<sub>s</sub>, C<sub>0</sub>, α]<sup>⊤</sup> on
                            experimental data. Parameters fixed for all subsequent stages.</p>
                    </div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-stage">
                        <div className="arch-icon" style={{ background: 'var(--violet-dim)', borderColor: 'rgba(167,139,250,.25)' }}>🤖</div>
                        <h4>Stage 2</h4>
                        <strong>Baseline LSTM</strong>
                        <p>Purely data-driven LSTM trained to minimise MSE on
                            one-step-ahead voltage prediction from sliding windows of
                            current–voltage samples.</p>
                    </div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-stage arch-stage-highlight">
                        <div className="arch-icon" style={{ background: 'rgba(244,63,94,.12)', borderColor: 'rgba(244,63,94,.25)' }}>⚡</div>
                        <h4>Stage 3</h4>
                        <strong>PI‑LSTM Training</strong>
                        <p>Pre-trained LSTM fine-tuned with physics penalty
                            L<sub>phys</sub> from the discrete-time RC model.
                            No online differentiation required.</p>
                    </div>
                </div>
            </div>

            {/* ════════ 3. RC MODEL & PARAMETERS ════════ */}
            <div className="glass-card chart-section fade-in fade-in-d2">
                <h2>RC Model & Identified Parameters</h2>
                <p className="chart-sub">
                    §3.2–3.3 — One-branch nonlinear RC equivalent circuit · CapTop 3000 F cell
                </p>

                <div className="eq-grid">
                    <div className="eq-block">
                        <span className="eq-label">Discrete-time state update</span>
                        <code className="eq-code">
                            v<sub>C</sub>(k+1) = v<sub>C</sub>(k) + T<sub>s</sub> · i(k) / C(v<sub>C</sub>(k))
                        </code>
                    </div>
                    <div className="eq-block">
                        <span className="eq-label">Terminal voltage</span>
                        <code className="eq-code">
                            v<sub>term</sub>(k) = v<sub>C</sub>(k) + R<sub>s</sub> · i(k)
                        </code>
                    </div>
                    <div className="eq-block">
                        <span className="eq-label">Nonlinear capacitance</span>
                        <code className="eq-code">
                            C(v) = C<sub>0</sub> + K · |v|
                        </code>
                    </div>
                </div>

                {/* Table 1 */}
                <div className="rw-table-wrap" style={{ marginTop: 20 }}>
                    <table className="rw-table">
                        <caption className="table-caption">Table 1 — Identified RC parameters (90 A profile, Differential Evolution)</caption>
                        <thead>
                            <tr>
                                <th>Model</th>
                                <th>R<sub>s</sub> [mΩ]</th>
                                <th>C<sub>0</sub> [F]</th>
                                <th>K [F/V]</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span className="model-badge lstm">LSTM</span></td>
                                <td>{(LSTM_PARAMS.Rs * 1000).toFixed(4)}</td>
                                <td>{LSTM_PARAMS.C0.toFixed(2)}</td>
                                <td>{LSTM_PARAMS.K}</td>
                            </tr>
                            <tr className="rw-row-highlight">
                                <td><span className="model-badge pi">PI‑LSTM</span></td>
                                <td>{(PILSTM_PARAMS.Rs * 1000).toFixed(4)}</td>
                                <td>{PILSTM_PARAMS.C0.toFixed(2)}</td>
                                <td>{PILSTM_PARAMS.K}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="params-grid" style={{ marginTop: 14 }}>
                    <span className="param-chip">CapTop cell = <strong>3000 F</strong></span>
                    <span className="param-chip">ESR (datasheet) = <strong>{(TRUE_PARAMS.Rs * 1000).toFixed(2)} mΩ</strong></span>
                    <span className="param-chip">Nominal K = <strong>{TRUE_PARAMS.K} F/V</strong></span>
                </div>
            </div>

            {/* ════════ 4. LOSS FUNCTION ════════ */}
            <div className="glass-card chart-section fade-in fade-in-d3">
                <h2>PI‑LSTM Learning Objective</h2>
                <p className="chart-sub">§3.4 — Combined data-driven and physics-informed loss</p>

                <div className="loss-grid">
                    <div className="loss-card">
                        <span className="loss-label">Data Loss</span>
                        <code className="eq-code eq-small">
                            L<sub>MSE</sub> = (1/N) Σ (v<sub>i</sub> − v̂<sub>i</sub>)²
                        </code>
                    </div>
                    <span className="loss-plus">+&nbsp;&nbsp;λ ·</span>
                    <div className="loss-card">
                        <span className="loss-label">Physics Penalty</span>
                        <code className="eq-code eq-small">
                            L<sub>phys</sub> = Σ (v̂<sub>term</sub>(k+1) − v̂<sub>RC</sub>(k+1))²
                        </code>
                    </div>
                    <span className="loss-eq">=</span>
                    <div className="loss-card loss-card-total">
                        <span className="loss-label">Total PI‑LSTM Loss</span>
                        <code className="eq-code eq-accent">
                            L<sub>tot</sub> = L<sub>MSE</sub> + λ · L<sub>phys</sub>
                        </code>
                    </div>
                </div>

                <div className="params-grid" style={{ marginTop: 14 }}>
                    <span className="param-chip">Batch size = <strong>64</strong></span>
                    <span className="param-chip">Epochs = <strong>20</strong></span>
                    <span className="param-chip">Optimizer = <strong>Adam</strong></span>
                    <span className="param-chip">RC params <strong>fixed</strong> during training</span>
                </div>
            </div>


            {/* ════════ 6. COMPARATIVE METRICS ════════ */}
            <div className="metrics-compare fade-in">
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

            {/* Paper metrics note for 90A */}
            {selectedId === '90a' && (
                <div className="glass-card chart-section fade-in" style={{ borderLeftColor: 'var(--cyan)', borderLeftWidth: 3, borderLeftStyle: 'solid' }}>
                    <h2 style={{ fontSize: '0.82rem' }}>📋 Paper-Reported Metrics (90 A Profile)</h2>
                    <div className="params-grid" style={{ marginTop: 8 }}>
                        <span className="param-chip">LSTM MAE = <strong>{paperMetrics.lstm.mae} V</strong></span>
                        <span className="param-chip">LSTM RMSE = <strong>{paperMetrics.lstm.rmse} V</strong></span>
                        <span className="param-chip">LSTM R² = <strong>{paperMetrics.lstm.r2}</strong></span>
                        <span className="param-chip" style={{ borderColor: 'rgba(244,63,94,.3)' }}>PI‑LSTM MAE = <strong style={{ color: 'var(--rose)' }}>{paperMetrics.piLstm.mae} V</strong></span>
                        <span className="param-chip" style={{ borderColor: 'rgba(244,63,94,.3)' }}>PI‑LSTM RMSE = <strong style={{ color: 'var(--rose)' }}>{paperMetrics.piLstm.rmse} V</strong></span>
                        <span className="param-chip" style={{ borderColor: 'rgba(244,63,94,.3)' }}>PI‑LSTM R² = <strong style={{ color: 'var(--rose)' }}>{paperMetrics.piLstm.r2}</strong></span>
                    </div>
                </div>
            )}

            {/* ════════ 7. VOLTAGE CHART ════════ */}
            <div className="glass-card chart-section fade-in fade-in-d2">
                <h2>Voltage Reconstruction — {scenario.name}</h2>
                <p className="chart-sub">
                    Solid: measurement &nbsp;|&nbsp; Long-dash: LSTM &nbsp;|&nbsp; Short-dash: PI‑LSTM
                </p>
                <VoltageChart
                    data={chartData}
                    measuredColor={scenario.accentColor}
                    baselineColor="#a78bfa"
                    predictedColor="#f43f5e"
                    measuredLabel="Measured"
                    baselineLabel="LSTM"
                    predictedLabel="PI‑LSTM"
                />
            </div>

            {/* ════════ 8. TRAINING EFFICIENCY ════════ */}
            <div className="glass-card chart-section fade-in fade-in-d3">
                <h2>Computational Efficiency</h2>
                <p className="chart-sub">§4.2.2 — Table 2 — AMD Ryzen 9, 32 GB RAM, NVIDIA RTX 3080</p>

                <div className="rw-table-wrap">
                    <table className="rw-table">
                        <caption className="table-caption">Table 2 — Training efficiency comparison</caption>
                        <thead>
                            <tr>
                                <th>Model</th>
                                <th>Avg. Time / Epoch</th>
                                <th>Epochs</th>
                                <th>Total Training Time</th>
                                <th>Stability</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span className="model-badge lstm">LSTM</span></td>
                                <td>{trainingEfficiency.lstm.avgTime} s</td>
                                <td>{trainingEfficiency.lstm.epochs}</td>
                                <td>{trainingEfficiency.lstm.totalTime.toLocaleString()} s</td>
                                <td><span className="stability-badge osc">⚠ {trainingEfficiency.lstm.stability}</span></td>
                            </tr>
                            <tr className="rw-row-highlight">
                                <td><span className="model-badge pi">PI‑LSTM</span></td>
                                <td>{trainingEfficiency.piLstm.avgTime} s</td>
                                <td>{trainingEfficiency.piLstm.epochs}</td>
                                <td>{trainingEfficiency.piLstm.totalTime.toLocaleString()} s</td>
                                <td><span className="stability-badge stable">✓ {trainingEfficiency.piLstm.stability}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Avg time bar chart */}
                <div style={{ height: 180, marginTop: 20 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={effBars} layout="vertical" margin={{ left: 60, right: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tick={{ fontSize: 11 }} label={{ value: 'Avg. seconds / epoch', position: 'insideBottom', offset: -10, style: { fill: '#64748b', fontSize: 11 } }} />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} />
                            <Bar dataKey="time" radius={[0, 6, 6, 0]}>
                                {effBars.map((e, i) => <Cell key={i} fill={e.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="params-grid" style={{ marginTop: 10 }}>
                    <span className="param-chip">Speedup = <strong style={{ color: 'var(--emerald)' }}>
                        {((1 - trainingEfficiency.piLstm.avgTime / trainingEfficiency.lstm.avgTime) * 100).toFixed(1)}%
                    </strong> faster per epoch</span>
                    <span className="param-chip">Time saved = <strong style={{ color: 'var(--emerald)' }}>
                        {(trainingEfficiency.lstm.totalTime - trainingEfficiency.piLstm.totalTime).toFixed(0)} s
                    </strong> total</span>
                </div>
            </div>

            {/* ════════ 9. TRAINING & VALIDATION LOSS ════════ */}
            <div className="online-charts" style={{ marginTop: 20 }}>
                <div className="glass-card chart-section">
                    <h2>LSTM — Training vs Validation Loss</h2>
                    <p className="chart-sub">Oscillatory validation loss, persistent gap</p>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lstmLossData} margin={{ top: 8, right: 24, bottom: 24, left: 12 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="epoch" tick={{ fontSize: 11 }} label={{ value: 'Epoch', position: 'insideBottom', offset: -14, style: { fill: '#64748b', fontSize: 11 } }} />
                                <YAxis tick={{ fontSize: 11 }} label={{ value: 'Loss', angle: -90, position: 'insideLeft', offset: 4, style: { fill: '#64748b', fontSize: 11 } }} />
                                <Tooltip content={<MiniTooltip />} />
                                <Line type="monotone" dataKey="trainLoss" name="Train" stroke="#a78bfa" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="valLoss" name="Validation" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card chart-section">
                    <h2>PI‑LSTM — Training vs Validation Loss</h2>
                    <p className="chart-sub">Closely matched, stable convergence</p>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={piLstmLossData} margin={{ top: 8, right: 24, bottom: 24, left: 12 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="epoch" tick={{ fontSize: 11 }} label={{ value: 'Epoch', position: 'insideBottom', offset: -14, style: { fill: '#64748b', fontSize: 11 } }} />
                                <YAxis tick={{ fontSize: 11 }} label={{ value: 'Loss', angle: -90, position: 'insideLeft', offset: 4, style: { fill: '#64748b', fontSize: 11 } }} />
                                <Tooltip content={<MiniTooltip />} />
                                <Line type="monotone" dataKey="trainLoss" name="Train" stroke="#10b981" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="valLoss" name="Validation" stroke="#00d4ff" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ════════ 9b. TRAINING TIME PER EPOCH ════════ */}
            <div className="online-charts" style={{ marginTop: 20 }}>
                <div className="glass-card chart-section">
                    <h2>LSTM — Training Time per Epoch</h2>
                    <p className="chart-sub">~700–745 s, oscillatory pattern (avg {trainingEfficiency.lstm.avgTime} s)</p>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lstmTimeData} margin={{ top: 8, right: 24, bottom: 24, left: 12 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="epoch" tick={{ fontSize: 11 }} label={{ value: 'Epoch', position: 'insideBottom', offset: -14, style: { fill: '#64748b', fontSize: 11 } }} />
                                <YAxis tick={{ fontSize: 11 }} domain={[500, 800]} label={{ value: 'Time [s]', angle: -90, position: 'insideLeft', offset: 4, style: { fill: '#64748b', fontSize: 11 } }} />
                                <Tooltip content={<MiniTooltip />} />
                                <Line type="monotone" dataKey="time" name="Time/epoch" stroke="#a78bfa" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card chart-section">
                    <h2>PI‑LSTM — Training Time per Epoch</h2>
                    <p className="chart-sub">Decreasing trend ~520 → 507 s (avg {trainingEfficiency.piLstm.avgTime} s)</p>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={piLstmTimeData} margin={{ top: 8, right: 24, bottom: 24, left: 12 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="epoch" tick={{ fontSize: 11 }} label={{ value: 'Epoch', position: 'insideBottom', offset: -14, style: { fill: '#64748b', fontSize: 11 } }} />
                                <YAxis tick={{ fontSize: 11 }} domain={[500, 800]} label={{ value: 'Time [s]', angle: -90, position: 'insideLeft', offset: 4, style: { fill: '#64748b', fontSize: 11 } }} />
                                <Tooltip content={<MiniTooltip />} />
                                <Line type="monotone" dataKey="time" name="Time/epoch" stroke="#10b981" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ════════ 10. SIMULINK VALIDATION ════════ */}
            <div className="glass-card chart-section fade-in fade-in-d4" style={{ marginTop: 20 }}>
                <h2>Simulink Validation Summary</h2>
                <p className="chart-sub">§4.2.3 — High-fidelity equivalent-circuit validation across operating regimes</p>

                <div className="sim-grid">
                    {['20a', '60a', '140a'].map((id) => {
                        const sc = scenarios.find((s) => s.id === id)!;
                        const m = sc.data.map((d) => d.measuredVoltage);
                        const lp = sc.data.map((d) => d.lstmVoltage);
                        const pp = sc.data.map((d) => d.piLstmVoltage);
                        return (
                            <div key={id} className="sim-card glass-card"
                                style={{ '--card-accent': sc.accentColor } as React.CSSProperties}
                                onClick={() => setSelectedId(id)} role="button" tabIndex={0}>
                                <span className="card-badge">{sc.profileType}</span>
                                <h3>{sc.currentAmplitude}</h3>
                                <div className="sim-metrics">
                                    <div><small>LSTM MAE</small><span>{(mae(m, lp) * 1000).toFixed(1)} mV</span></div>
                                    <div><small>PI‑LSTM MAE</small><span className="sim-better">{(mae(m, pp) * 1000).toFixed(1)} mV</span></div>
                                </div>
                                <div className="sim-metrics">
                                    <div><small>LSTM R²</small><span>{rSquared(m, lp).toFixed(4)}</span></div>
                                    <div><small>PI‑LSTM R²</small><span className="sim-better">{rSquared(m, pp).toFixed(4)}</span></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <p className="chart-sub" style={{ marginTop: 16, maxWidth: 'none' }}>
                    The Simulink validation confirms that the PI‑LSTM-identified parameters are physically meaningful
                    and generalise across low-, medium-, and high-current operating regimes, supporting future
                    hardware-in-the-loop deployment.
                </p>
            </div>


            {/* ════════ 11. DEPLOYABILITY ════════ */}
            <div className="glass-card chart-section fade-in fade-in-d4" style={{ marginTop: 20, borderTop: '2px solid var(--rose)' }}>
                <h2>Practical Deployability</h2>
                <p className="chart-sub" style={{ maxWidth: 'none' }}>§3.6 — Designed for clean-energy storage systems with stringent compute and real-time constraints</p>
                <div className="deploy-chips">
                    <span className="deploy-chip"><span className="deploy-icon">📐</span>Discrete-time — no ODE solvers needed</span>
                    <span className="deploy-chip"><span className="deploy-icon">🔗</span>Decoupled training — no co-optimization instability</span>
                    <span className="deploy-chip"><span className="deploy-icon">⚡</span>Algebraic RC updates — runs on low-power MCUs</span>
                    <span className="deploy-chip"><span className="deploy-icon">🔄</span>Offline trained → deploy as lightweight inference block</span>
                    <span className="deploy-chip"><span className="deploy-icon">🏭</span>Compatible with existing BMS data pipelines</span>
                    <span className="deploy-chip"><span className="deploy-icon">✅</span>Fixed physics params simplify V&V for safety-critical apps</span>
                </div>
            </div>
        </div>
    );
}
