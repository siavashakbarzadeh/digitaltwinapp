import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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
import { createRLS, rlsUpdate, thetaToPhysical } from '../utils/rlsEstimator';
import VoltageChart from '../components/VoltageChart';
import ParameterChart from '../components/ParameterChart';

/* ── Online Twin Constants ── */
const TRUE_C = 50;   // Farad
const TRUE_R = 2;    // Ω
const DT = 0.1;      // seconds per step
const TICK_MS = 60;   // ms per animation frame
const MAX_POINTS = 400;
const TRUE_A = 1 - DT / (TRUE_R * TRUE_C);
const TRUE_B = DT / TRUE_C;

function currentSignal(t: number): number {
    return (
        8 * Math.sin((2 * Math.PI * t) / 20) +
        4 * Math.sin((2 * Math.PI * t) / 7) +
        (t > 15 && t < 25 ? 6 : 0) +
        (t > 40 ? -3 : 0)
    );
}

function mNoise(k: number): number {
    const x = Math.sin(k * 17.31 + 43.72) * 29871.1;
    return (x - Math.floor(x) - 0.5) * 0.01;
}

interface VPoint { time: number; measured: number; predicted: number }
interface PPoint { step: number; C: number; R: number }

/* ── Offline Reusable Components ── */
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

export default function DigitalTwinHub() {
    const [subTab, setSubTab] = useState<'online' | 'offline'>('online');

    // --- Online State ---
    const [running, setRunning] = useState(false);
    const [voltData, setVoltData] = useState<VPoint[]>([]);
    const [paramData, setParamData] = useState<PPoint[]>([]);
    const [estC, setEstC] = useState(0);
    const [estR, setEstR] = useState(0);
    const [simTime, setSimTime] = useState(0);
    const sim = useRef({
        k: 0, vTrue: 0.5, vModel: 0.5,
        rls: createRLS(0.995, 0.9980, 0.0050, 300),
        vBuf: [] as VPoint[], pBuf: [] as PPoint[],
    });
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // --- Offline State ---
    const [selectedOfflineId, setSelectedOfflineId] = useState(scenarios[0].id);
    const offlineScenario = useMemo(() => scenarios.find((s) => s.id === selectedOfflineId) || scenarios[0], [selectedOfflineId]);

    const metricsLstm = useMemo(() => {
        const measured = offlineScenario.data.map((d) => d.measuredVoltage);
        const pred = offlineScenario.data.map((d) => d.lstmVoltage);
        return { mae: mae(measured, pred), rmse: rmse(measured, pred), r2: rSquared(measured, pred) };
    }, [offlineScenario]);

    const metricsPi = useMemo(() => {
        const measured = offlineScenario.data.map((d) => d.measuredVoltage);
        const pred = offlineScenario.data.map((d) => d.piLstmVoltage);
        return { mae: mae(measured, pred), rmse: rmse(measured, pred), r2: rSquared(measured, pred) };
    }, [offlineScenario]);

    const offlineChartData = useMemo(() =>
        offlineScenario.data.map((d) => ({
            time: d.time,
            measured: d.measuredVoltage,
            baseline: d.lstmVoltage,
            predicted: d.piLstmVoltage,
        })),
        [offlineScenario]);

    const effBars = [
        { name: 'LSTM', time: trainingEfficiency.lstm.avgTime, fill: '#a78bfa' },
        { name: 'PI‑LSTM', time: trainingEfficiency.piLstm.avgTime, fill: '#10b981' },
    ];

    // --- RLS Callbacks ---
    const tick = useCallback(() => {
        const s = sim.current;
        const t = s.k * DT;
        const I = currentSignal(t);
        const vNext = TRUE_A * s.vTrue + TRUE_B * I;
        const vMeas = vNext + mNoise(s.k);
        const phi: [number, number] = [s.vModel, I];
        s.rls = rlsUpdate(s.rls, phi, vMeas);
        const aEst = s.rls.theta[0];
        const bEst = s.rls.theta[1];
        const vModelNext = aEst * s.vModel + bEst * I;

        s.vBuf.push({ time: parseFloat(t.toFixed(2)), measured: parseFloat(vMeas.toFixed(5)), predicted: parseFloat(vModelNext.toFixed(5)) });
        if (s.vBuf.length > MAX_POINTS) s.vBuf.shift();

        const phys = thetaToPhysical(s.rls.theta, DT);
        s.pBuf.push({ step: s.k, C: parseFloat(phys.C.toFixed(3)), R: parseFloat(phys.R.toFixed(5)) });
        if (s.pBuf.length > MAX_POINTS) s.pBuf.shift();

        s.vTrue = vNext;
        s.vModel = vModelNext;
        s.k += 1;

        setVoltData([...s.vBuf]);
        setParamData([...s.pBuf]);
        setEstC(phys.C);
        setEstR(phys.R);
        setSimTime(parseFloat(t.toFixed(1)));
    }, []);

    const start = useCallback(() => {
        if (timerRef.current) return;
        setRunning(true);
        timerRef.current = setInterval(tick, TICK_MS);
    }, [tick]);

    const stop = useCallback(() => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        setRunning(false);
    }, []);

    const reset = useCallback(() => {
        stop();
        sim.current = {
            k: 0, vTrue: 0.5, vModel: 0.5,
            rls: createRLS(0.995, 0.9980, 0.0050, 300),
            vBuf: [], pBuf: [],
        };
        setVoltData([]); setParamData([]); setEstC(0); setEstR(0); setSimTime(0);
    }, [stop]);

    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

    return (
        <div className="fade-in">
            {/* ── Sub-Navigation Tabs ── */}
            <div className="sub-tabs-container glass-card">
                <button
                    className={`sub-tab ${subTab === 'online' ? 'active' : ''}`}
                    onClick={() => setSubTab('online')}
                >
                    <span className="sub-tab-icon">📡</span>
                    Live RLS Dashboard
                </button>
                <button
                    className={`sub-tab ${subTab === 'offline' ? 'active' : ''}`}
                    onClick={() => setSubTab('offline')}
                >
                    <span className="sub-tab-icon">📊</span>
                    Analytical Validation (PI‑LSTM)
                </button>
            </div>

            {subTab === 'online' ? (
                /* ════════════════ ONLINE TWIN CONTENT ════════════════ */
                <div className="online-twin-view fade-in">
                    <div className="online-hero-banner">
                        <h2>🔴 Real-Time Monitoring Hub</h2>
                        <p>RLS recursive parameter identification on a linear RC model.</p>
                        <div className="equation-highlight" style={{ marginTop: 12 }}>
                            V[k+1] = a·V[k] + b·I[k] &nbsp;&nbsp;|&nbsp;&nbsp; C = Δt/b &nbsp;&nbsp;|&nbsp;&nbsp; R = b/(1−a)
                        </div>
                    </div>

                    <div className="anim-stats-row">
                        <div className="anim-stat-card" style={{ '--card-color': 'var(--cyan)' } as React.CSSProperties}>
                            <span className="anim-stat-icon">⚡</span>
                            <span className="anim-stat-value">RLS</span>
                            <span className="anim-stat-label">Algorithm</span>
                        </div>
                        <div className="anim-stat-card" style={{ '--card-color': 'var(--emerald)' } as React.CSSProperties}>
                            <span className="anim-stat-icon">⏱</span>
                            <span className="anim-stat-value">60ms</span>
                            <span className="anim-stat-label">Tick Rate</span>
                        </div>
                        <div className="anim-stat-card" style={{ '--card-color': 'var(--amber)' } as React.CSSProperties}>
                            <span className="anim-stat-icon">🔄</span>
                            <span className="anim-stat-value">λ=0.995</span>
                            <span className="anim-stat-label">Forgetting</span>
                        </div>
                    </div>

                    <div className="online-controls glass-card">
                        {!running ? (
                            <button className="btn btn-primary" onClick={start}>▶ Start Stream</button>
                        ) : (
                            <button className="btn btn-danger" onClick={stop}>⏸ Pause</button>
                        )}
                        <button className="btn" onClick={reset}>↺ Reset</button>
                        <span className="status-badge">
                            <span className={running ? "status-dot pulse" : "status-dot"} />
                            {running ? "STREAMING" : "IDLE"} — t = {simTime} s
                        </span>
                    </div>

                    <div className="live-params">
                        <div className="glass-card live-param">
                            <label>Capacitance (C)</label>
                            <div className="lp-val">{estC > 0 ? estC.toFixed(2) : '—'} F</div>
                            <small>True: {TRUE_C} F</small>
                        </div>
                        <div className="glass-card live-param">
                            <label>Resistance (R)</label>
                            <div className="lp-val">{estR > 0 ? (estR * 1000).toFixed(2) : '—'} mΩ</div>
                            <small>True: {(TRUE_R * 1000).toFixed(2)} mΩ</small>
                        </div>
                    </div>

                    <div className="online-charts">
                        <div className="glass-card chart-section">
                            <h3>Live Voltage Tracking</h3>
                            <p className="chart-sub">Measured (true + noise) vs. RLS model prediction</p>
                            <VoltageChart data={voltData} measuredColor="#00d4ff" predictedColor="#10b981" />
                        </div>
                        <div className="glass-card chart-section">
                            <h3>Parameter Convergence</h3>
                            <p className="chart-sub">Dynamic estimation of C and R over time</p>
                            <ParameterChart data={paramData} trueC={TRUE_C} trueR={TRUE_R} />
                        </div>
                    </div>
                </div>
            ) : (
                /* ════════════════ OFFLINE TWIN CONTENT ════════════════ */
                <div className="offline-twin-view fade-in">
                    <div className="offline-hero-banner">
                        <h2>📊 PI‑LSTM Analytical Validation</h2>
                        <p>Deep-dive into Physics-Informed sequence modeling accuracy and training metrics.</p>
                        <div className="equation-highlight" style={{ marginTop: 12 }}>
                            ℒ = ℒ<sub>data</sub> + λ · ℒ<sub>physics</sub> &nbsp;&nbsp;|&nbsp;&nbsp; Multi-stage Offline Workflow
                        </div>
                    </div>

                    {/* Scenario Grid */}
                    <div className="scenario-grid" style={{ marginBottom: 24 }}>
                        {scenarios.filter(s => ['sc-new-90a', 'bat-new-20a', 'bat-new-60a', 'sc-new-140a'].includes(s.id)).map((s) => (
                            <ProfileCard
                                key={s.id} s={s}
                                selected={s.id === selectedOfflineId}
                                onClick={() => setSelectedOfflineId(s.id)}
                            />
                        ))}
                    </div>

                    {/* Metrics Comparison */}
                    <div className="metrics-compare" style={{ marginBottom: 24 }}>
                        <div className="glass-card metric-compare-card">
                            <span className="model-badge lstm">Standard LSTM</span>
                            <div className="mc-row"><span>MAE</span><strong>{(metricsLstm.mae * 1000).toFixed(2)} mV</strong></div>
                            <div className="mc-row"><span>R²</span><strong>{metricsLstm.r2.toFixed(6)}</strong></div>
                        </div>
                        <div className="mc-vs">VS</div>
                        <div className="glass-card metric-compare-card mc-highlight">
                            <span className="model-badge pi">PI‑LSTM (Proposed)</span>
                            <div className="mc-row"><span>MAE</span><strong>{(metricsPi.mae * 1000).toFixed(2)} mV</strong></div>
                            <div className="mc-row"><span>R²</span><strong>{metricsPi.r2.toFixed(6)}</strong></div>
                        </div>
                    </div>

                    {/* Voltage Chart */}
                    <div className="glass-card chart-section" style={{ marginBottom: 24 }}>
                        <h3>Voltage Reconstruction Accuracy — {offlineScenario.name}</h3>
                        <p className="chart-sub">Comparing physical consistency of PI‑LSTM vs baseline data-driven model</p>
                        <VoltageChart
                            data={offlineChartData}
                            measuredColor={offlineScenario.accentColor}
                            baselineColor="#a78bfa"
                            predictedColor="#f43f5e"
                            measuredLabel="Measured"
                            baselineLabel="LSTM"
                            predictedLabel="PI‑LSTM"
                        />
                    </div>

                    {/* Training Performance */}
                    <div className="online-charts">
                        <div className="glass-card chart-section">
                            <h3>Learning Stability</h3>
                            <p className="chart-sub">PI‑LSTM validation loss vs Standard LSTM</p>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={240}>
                                    <LineChart data={piLstmLossData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="epoch" />
                                        <YAxis />
                                        <Tooltip content={<MiniTooltip />} />
                                        <Line type="monotone" dataKey="trainLoss" name="Train" stroke="#10b981" />
                                        <Line type="monotone" dataKey="valLoss" name="Val" stroke="#00d4ff" strokeDasharray="5 5" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="glass-card chart-section">
                            <h3>Inference Cost</h3>
                            <p className="chart-sub">Avg training time (s) per epoch</p>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={effBars}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Bar dataKey="time" radius={[6, 6, 0, 0]}>
                                            {effBars.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
