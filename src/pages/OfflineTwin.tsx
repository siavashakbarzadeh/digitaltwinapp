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
                <h2>📊 Offline Digital Twin — PI‑LSTM Framework</h2>
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

            {/* ════════ 5. SCENARIO SELECTOR ════════ */}
            <h2 className="section-title" style={{ marginTop: 36 }}>Performance Evaluation</h2>
            <p className="section-subtitle">
                §4 — Select an excitation profile to compare measured voltage with LSTM
                and PI‑LSTM reconstructions. The 90 A profile is the primary evaluation;
                20 / 60 / 140 A profiles are Simulink validation cases.
            </p>

            <div className="scenario-grid">
                {scenarios.map((s) => (
                    <ProfileCard
                        key={s.id} s={s}
                        selected={s.id === selectedId}
                        onClick={() => setSelectedId(s.id)}
                    />
                ))}
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

            {/* ════════ SUPERCAPACITOR DIGITAL TWIN DIAGRAM ════════ */}
            <div className="glass-card chart-section fade-in fade-in-d3" style={{ marginTop: 20, borderTop: '2px solid var(--cyan)' }}>
                <h2>🔋 Offline Digital Twin Architecture — Supercapacitor</h2>
                <p className="chart-sub" style={{ maxWidth: 'none' }}>
                    A high-level view of the physical supercapacitor–digital twin coupling.
                    Sensor data flows from the physical device into the offline PI‑LSTM model,
                    which embeds RC circuit physics to produce accurate voltage predictions.
                </p>

                <svg viewBox="0 0 700 340" width="100%" style={{ maxWidth: 800, display: 'block', margin: '16px auto 0' }}>
                    <defs>
                        <linearGradient id="offDtG1" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.08" />
                        </linearGradient>
                        <linearGradient id="offDtG2" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.08" />
                        </linearGradient>
                        <filter id="offGlow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>

                    {/* ── Background panels ── */}
                    <rect x="10" y="10" width="310" height="320" rx="16" fill="url(#offDtG1)" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.3" />
                    <rect x="380" y="10" width="310" height="320" rx="16" fill="url(#offDtG2)" stroke="#10b981" strokeWidth="0.8" strokeOpacity="0.3" />

                    {/* ── Panel titles ── */}
                    <text x="165" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill="#00d4ff">🔌 Physical Supercapacitor</text>
                    <text x="535" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill="#10b981">💻 Offline Digital Twin (PI-LSTM)</text>

                    {/* ── LEFT: Physical supercapacitor ── */}
                    <rect x="85" y="65" width="160" height="190" rx="12" fill="rgba(0,212,255,0.04)" stroke="#00d4ff" strokeWidth="1.2">
                        <animate attributeName="stroke-opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
                    </rect>
                    {/* Electrodes */}
                    <rect x="105" y="80" width="12" height="160" rx="3" fill="#f59e0b" opacity="0.7">
                        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite" />
                    </rect>
                    <rect x="213" y="80" width="12" height="160" rx="3" fill="#f59e0b" opacity="0.7">
                        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite" begin="0.5s" />
                    </rect>
                    {/* Separator */}
                    <line x1="165" y1="80" x2="165" y2="240" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="4 3">
                        <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="2.5s" repeatCount="indefinite" />
                    </line>

                    {/* Electrolyte ions (animated) */}
                    {[
                        { cx: 135, cy: 120, r: 3, color: '#f43f5e', dur: '2.8s', dx: 25 },
                        { cx: 140, cy: 155, r: 2.5, color: '#00d4ff', dur: '3.2s', dx: 20 },
                        { cx: 130, cy: 190, r: 3, color: '#f43f5e', dur: '2.5s', dx: 30 },
                        { cx: 195, cy: 130, r: 2.5, color: '#00d4ff', dur: '3s', dx: -25 },
                        { cx: 190, cy: 170, r: 3, color: '#f43f5e', dur: '2.6s', dx: -20 },
                        { cx: 200, cy: 210, r: 2.5, color: '#00d4ff', dur: '3.4s', dx: -30 },
                    ].map((ion, i) => (
                        <circle key={`off-ion-${i}`} cx={ion.cx} cy={ion.cy} r={ion.r} fill={ion.color} opacity="0.8" filter="url(#offGlow)">
                            <animate attributeName="cx" values={`${ion.cx};${ion.cx + ion.dx};${ion.cx}`} dur={ion.dur} repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.4;1;0.4" dur={ion.dur} repeatCount="indefinite" />
                        </circle>
                    ))}

                    {/* Terminals */}
                    <line x1="165" y1="55" x2="165" y2="65" stroke="#f59e0b" strokeWidth="2" />
                    <circle cx="165" cy="52" r="4" fill="#f59e0b" opacity="0.9">
                        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <line x1="165" y1="255" x2="165" y2="265" stroke="#f59e0b" strokeWidth="2" />
                    <circle cx="165" cy="268" r="4" fill="#f59e0b" opacity="0.9">
                        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" begin="1s" />
                    </circle>

                    {/* Sensor labels & dots */}
                    <text x="75" y="105" fontSize="7" fill="rgba(255,255,255,0.5)">V(t)</text>
                    <text x="75" y="165" fontSize="7" fill="rgba(255,255,255,0.5)">I(t)</text>
                    <text x="75" y="225" fontSize="7" fill="rgba(255,255,255,0.5)">T(t)</text>
                    {[105, 165, 225].map((y, i) => (
                        <React.Fragment key={`off-sensor-${i}`}>
                            <circle cx="85" cy={y} r="3" fill={['#00d4ff', '#f59e0b', '#f43f5e'][i]} opacity="0.8">
                                <animate attributeName="r" values="2;4;2" dur="1.8s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
                            </circle>
                            <line x1="88" y1={y} x2="105" y2={y} stroke={['#00d4ff', '#f59e0b', '#f43f5e'][i]} strokeWidth="0.6" strokeOpacity="0.4" />
                        </React.Fragment>
                    ))}

                    {/* RC circuit labels inside the body */}
                    <text x="165" y="270" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.35)">Rₛ = 0.088 Ω · C₀ = 21 F · α = 0.82</text>

                    {/* ── CENTER: Digital Thread ── */}
                    <line x1="320" y1="140" x2="380" y2="140" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.3" />
                    <line x1="320" y1="180" x2="380" y2="180" stroke="#10b981" strokeWidth="1" strokeOpacity="0.3" />
                    <polygon points="375,136 385,140 375,144" fill="#00d4ff" opacity="0.7">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
                    </polygon>
                    <polygon points="325,176 315,180 325,184" fill="#10b981" opacity="0.7">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.7s" />
                    </polygon>
                    {/* Data packets flowing right */}
                    {[0, 1, 2].map((i) => (
                        <rect key={`off-pkt-r-${i}`} width="8" height="4" rx="2" fill="#00d4ff" opacity="0.8" filter="url(#offGlow)">
                            <animate attributeName="x" values="320;372" dur="1.8s" repeatCount="indefinite" begin={`${i * 0.6}s`} />
                            <animate attributeName="y" values="138;138" dur="1.8s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" repeatCount="indefinite" begin={`${i * 0.6}s`} />
                        </rect>
                    ))}
                    {/* Data packets flowing left */}
                    {[0, 1].map((i) => (
                        <rect key={`off-pkt-l-${i}`} width="8" height="4" rx="2" fill="#10b981" opacity="0.8" filter="url(#offGlow)">
                            <animate attributeName="x" values="372;320" dur="2s" repeatCount="indefinite" begin={`${i * 0.9}s`} />
                            <animate attributeName="y" values="178;178" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" begin={`${i * 0.9}s`} />
                        </rect>
                    ))}
                    <text x="350" y="122" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.5)">Offline Data →</text>
                    <text x="350" y="198" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.5)">← Predictions</text>
                    <text x="350" y="155" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#a78bfa">Offline</text>
                    <text x="350" y="166" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#a78bfa">Digital Thread</text>

                    {/* ── RIGHT: Digital Twin Model ── */}
                    {/* PI-LSTM Block */}
                    <rect x="410" y="60" width="250" height="70" rx="10" fill="rgba(16,185,129,0.06)" stroke="#10b981" strokeWidth="0.8">
                        <animate attributeName="stroke-opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
                    </rect>
                    <text x="535" y="78" textAnchor="middle" fontSize="8" fontWeight="600" fill="#10b981">Offline PI-LSTM Network</text>
                    {/* LSTM cells */}
                    {[440, 500, 560, 620].map((x, i) => (
                        <React.Fragment key={`off-lstm-${i}`}>
                            <rect x={x} y="88" width="30" height="28" rx="5" fill="rgba(0,212,255,0.08)" stroke="#00d4ff" strokeWidth="0.8">
                                <animate attributeName="fill-opacity" values="0.3;0.8;0.3" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                            </rect>
                            <text x={x + 15} y="106" textAnchor="middle" fontSize="7" fill="#00d4ff">h{i + 1}</text>
                            {i < 3 && <line x1={x + 30} y1="102" x2={x + 60} y2="102" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.4" />}
                        </React.Fragment>
                    ))}

                    {/* Physics constraint block */}
                    <rect x="410" y="145" width="250" height="55" rx="10" fill="rgba(245,158,11,0.06)" stroke="#f59e0b" strokeWidth="0.8">
                        <animate attributeName="stroke-opacity" values="0.3;0.7;0.3" dur="3.5s" repeatCount="indefinite" />
                    </rect>
                    <text x="535" y="163" textAnchor="middle" fontSize="8" fontWeight="600" fill="#f59e0b">⚡ RC Physics Constraints</text>
                    <text x="535" y="178" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.45)">ℒ = ℒ_data + λ · ℒ_physics</text>
                    <text x="535" y="192" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.35)">v[k+1] = f(v[k], i[k], Rₛ, Rₚ, C)</text>

                    {/* Output prediction block */}
                    <rect x="440" y="215" width="190" height="55" rx="10" fill="rgba(164,139,250,0.06)" stroke="#a78bfa" strokeWidth="0.8">
                        <animate attributeName="stroke-opacity" values="0.3;0.7;0.3" dur="2.8s" repeatCount="indefinite" />
                    </rect>
                    <text x="535" y="233" textAnchor="middle" fontSize="8" fontWeight="600" fill="#a78bfa">📊 Offline Predictions</text>
                    {/* Output metrics */}
                    {[
                        { label: 'V(k)', x: 465, color: '#10b981' },
                        { label: 'SOC', x: 505, color: '#00d4ff' },
                        { label: 'Rₛ', x: 545, color: '#f59e0b' },
                        { label: 'C₀', x: 580, color: '#f43f5e' },
                        { label: 'α', x: 610, color: '#a78bfa' },
                    ].map((m) => (
                        <React.Fragment key={`off-metric-${m.label}`}>
                            <circle cx={m.x} cy="255" r="6" fill={m.color} opacity="0.2">
                                <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
                            </circle>
                            <text x={m.x} y="257" textAnchor="middle" fontSize="6" fontWeight="600" fill={m.color}>{m.label}</text>
                        </React.Fragment>
                    ))}

                    {/* Connection arrows between layers */}
                    <line x1="535" y1="130" x2="535" y2="145" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                    <line x1="535" y1="200" x2="535" y2="215" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />

                    {/* Bottom labels */}
                    <text x="165" y="300" textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.4)">Historical / Offline Measurements</text>
                    <text x="535" y="290" textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.4)">Offline-Trained PI-LSTM Surrogate</text>

                    {/* Offline badge */}
                    <rect x="460" y="295" width="150" height="22" rx="11" fill="rgba(167,139,250,0.12)" stroke="#a78bfa" strokeWidth="0.6" strokeOpacity="0.4" />
                    <text x="535" y="310" textAnchor="middle" fontSize="7" fontWeight="600" fill="#a78bfa">🏷️ OFFLINE • BATCH TRAINED</text>
                </svg>
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
