import React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { createRLS, rlsUpdate, thetaToPhysical } from '../utils/rlsEstimator';
import VoltageChart from '../components/VoltageChart';
import ParameterChart from '../components/ParameterChart';

/* ── True system parameters ── */
const TRUE_C = 50;   // Farad
const TRUE_R = 2;    // Ω
const DT = 0.1;      // seconds per step
const TICK_MS = 60;   // ms per animation frame
const MAX_POINTS = 400;

/* True discrete model:  V[k+1] = a·V[k] + b·I[k] */
const TRUE_A = 1 - DT / (TRUE_R * TRUE_C);
const TRUE_B = DT / TRUE_C;

/* Synthetic current signal */
function currentSignal(t: number): number {
    return (
        8 * Math.sin((2 * Math.PI * t) / 20) +
        4 * Math.sin((2 * Math.PI * t) / 7) +
        (t > 15 && t < 25 ? 6 : 0) +
        (t > 40 ? -3 : 0)
    );
}

/* Deterministic measurement noise */
function mNoise(k: number): number {
    const x = Math.sin(k * 17.31 + 43.72) * 29871.1;
    return (x - Math.floor(x) - 0.5) * 0.01;
}

interface VPoint { time: number; measured: number; predicted: number }
interface PPoint { step: number; C: number; R: number }

export default function OnlineTwin() {
    const [running, setRunning] = useState(false);
    const [voltData, setVoltData] = useState<VPoint[]>([]);
    const [paramData, setParamData] = useState<PPoint[]>([]);
    const [estC, setEstC] = useState(0);
    const [estR, setEstR] = useState(0);
    const [simTime, setSimTime] = useState(0);

    /* mutable simulation state kept in a ref so the interval callback
       always sees the latest values without triggering re‑renders */
    const sim = useRef({
        k: 0,
        vTrue: 0.5,          // start at 0.5 V
        vModel: 0.5,
        rls: createRLS(0.995, 0.9980, 0.0050, 300),
        vBuf: [] as VPoint[],
        pBuf: [] as PPoint[],
    });

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const tick = useCallback(() => {
        const s = sim.current;
        const t = s.k * DT;
        const I = currentSignal(t);

        /* ── true system ── */
        const vNext = TRUE_A * s.vTrue + TRUE_B * I;
        const vMeas = vNext + mNoise(s.k);

        /* ── RLS update ── */
        const phi: [number, number] = [s.vModel, I];
        s.rls = rlsUpdate(s.rls, phi, vMeas);
        const aEst = s.rls.theta[0];
        const bEst = s.rls.theta[1];
        const vModelNext = aEst * s.vModel + bEst * I;

        /* ── push to buffers ── */
        s.vBuf.push({ time: parseFloat(t.toFixed(2)), measured: parseFloat(vMeas.toFixed(5)), predicted: parseFloat(vModelNext.toFixed(5)) });
        if (s.vBuf.length > MAX_POINTS) s.vBuf.shift();

        const phys = thetaToPhysical(s.rls.theta, DT);
        s.pBuf.push({ step: s.k, C: parseFloat(phys.C.toFixed(3)), R: parseFloat(phys.R.toFixed(5)) });
        if (s.pBuf.length > MAX_POINTS) s.pBuf.shift();

        s.vTrue = vNext;
        s.vModel = vModelNext;
        s.k += 1;

        /* ── update React state (triggers render) ── */
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
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setRunning(false);
    }, []);

    const reset = useCallback(() => {
        stop();
        sim.current = {
            k: 0,
            vTrue: 0.5,
            vModel: 0.5,
            rls: createRLS(0.995, 0.9980, 0.0050, 300),
            vBuf: [],
            pBuf: [],
        };
        setVoltData([]);
        setParamData([]);
        setEstC(0);
        setEstR(0);
        setSimTime(0);
    }, [stop]);

    /* cleanup on unmount */
    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

    return (
        <div className="fade-in">
            {/* ── Animated Hero Banner ── */}
            <div className="online-hero-banner fade-in">
                <h2>🔴 Online Digital Twin — Real-Time RLS</h2>
                <p>
                    Real-time parameter identification using Recursive Least Squares (RLS)
                    on a linear RC model. Watch the algorithm adapt C and R live as synthetic
                    current drives the system.
                </p>
                <div className="equation-highlight" style={{ marginTop: 12 }}>
                    V[k+1] = a·V[k] + b·I[k] &nbsp;&nbsp;|&nbsp;&nbsp; C = Δt/b &nbsp;&nbsp;|&nbsp;&nbsp; R = b/(1−a)
                </div>
            </div>

            {/* ── Animated Stats Row ── */}
            <div className="anim-stats-row fade-in fade-in-d1">
                <div className="anim-stat-card" style={{ '--card-color': 'var(--cyan)' } as React.CSSProperties}>
                    <span className="anim-stat-icon">⚡</span>
                    <span className="anim-stat-value" style={{ color: 'var(--cyan)' }}>RLS</span>
                    <span className="anim-stat-label">Algorithm</span>
                </div>
                <div className="anim-stat-card" style={{ '--card-color': 'var(--emerald)' } as React.CSSProperties}>
                    <span className="anim-stat-icon">📡</span>
                    <span className="anim-stat-value" style={{ color: 'var(--emerald)' }}>60ms</span>
                    <span className="anim-stat-label">Tick Rate</span>
                </div>
                <div className="anim-stat-card" style={{ '--card-color': 'var(--amber)' } as React.CSSProperties}>
                    <span className="anim-stat-icon">🔄</span>
                    <span className="anim-stat-value" style={{ color: 'var(--amber)' }}>λ=0.995</span>
                    <span className="anim-stat-label">Forgetting Factor</span>
                </div>
                <div className="anim-stat-card" style={{ '--card-color': 'var(--violet)' } as React.CSSProperties}>
                    <span className="anim-stat-icon">🎯</span>
                    <span className="anim-stat-value" style={{ color: 'var(--violet)' }}>2</span>
                    <span className="anim-stat-label">Parameters</span>
                </div>
            </div>

            {/* ── Step Flow Diagram ── */}
            <div className="glass-card fade-in fade-in-d2" style={{ padding: '18px 24px', marginBottom: 24 }}>
                <h3 style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    🔁 RLS Pipeline
                </h3>
                <div className="step-flow">
                    <div className="step-node"><div className="step-node-icon" style={{ '--node-color': '#f59e0b', '--node-bg': 'rgba(245,158,11,.08)' } as React.CSSProperties}>🔌</div><span className="step-node-label">Current I(t)</span></div>
                    <span className="step-arrow">→</span>
                    <div className="step-node"><div className="step-node-icon" style={{ '--node-color': '#00d4ff', '--node-bg': 'rgba(0,212,255,.08)' } as React.CSSProperties}>⚙️</div><span className="step-node-label">True System</span></div>
                    <span className="step-arrow">→</span>
                    <div className="step-node"><div className="step-node-icon" style={{ '--node-color': '#f43f5e', '--node-bg': 'rgba(244,63,94,.08)' } as React.CSSProperties}>📏</div><span className="step-node-label">V_meas + Noise</span></div>
                    <span className="step-arrow">→</span>
                    <div className="step-node"><div className="step-node-icon" style={{ '--node-color': '#10b981', '--node-bg': 'rgba(16,185,129,.08)' } as React.CSSProperties}>🧠</div><span className="step-node-label">RLS Update</span></div>
                    <span className="step-arrow">→</span>
                    <div className="step-node"><div className="step-node-icon" style={{ '--node-color': '#a78bfa', '--node-bg': 'rgba(167,139,250,.08)' } as React.CSSProperties}>📊</div><span className="step-node-label">θ → C, R</span></div>
                </div>
            </div>

            {/* Controls */}
            <div className="online-controls fade-in fade-in-d3">
                {!running ? (
                    <button className="btn btn-primary" onClick={start}>▶ Start</button>
                ) : (
                    <button className="btn btn-danger" onClick={stop}>⏸ Pause</button>
                )}
                <button className="btn" onClick={reset}>↺ Reset</button>
                {running && (
                    <span className="status-badge">
                        <span className="status-dot" />
                        LIVE &nbsp;— t = {simTime} s
                    </span>
                )}
                {!running && simTime > 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Paused at t = {simTime} s
                    </span>
                )}
            </div>

            {/* Live parameter estimates */}
            <div className="live-params">
                <div className="glass-card live-param">
                    <div className="lp-label">Capacitance (C)</div>
                    <div className="lp-row">
                        <span className="lp-est">{estC > 0 ? estC.toFixed(2) : '—'} F</span>
                        <span className="lp-true">true: {TRUE_C} F</span>
                    </div>
                </div>
                <div className="glass-card live-param">
                    <div className="lp-label">Resistance (R)</div>
                    <div className="lp-row">
                        <span className="lp-est">{estR > 0 ? estR.toFixed(4) : '—'} Ω</span>
                        <span className="lp-true">true: {TRUE_R} Ω</span>
                    </div>
                </div>
                <div className="glass-card live-param">
                    <div className="lp-label">Forgetting Factor (λ)</div>
                    <div className="lp-row">
                        <span className="lp-est">0.995</span>
                        <span className="lp-true">RLS config</span>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="online-charts" style={{ marginTop: 24 }}>
                <div className="glass-card chart-section">
                    <h2>Live Voltage</h2>
                    <p className="chart-sub">Measured (true + noise) vs. RLS model output</p>
                    <VoltageChart
                        data={voltData}
                        measuredColor="#00d4ff"
                        predictedColor="#10b981"
                    />
                </div>
                <div className="glass-card chart-section">
                    <h2>Parameter Convergence</h2>
                    <p className="chart-sub">Estimated C and R converging toward true values</p>
                    <ParameterChart data={paramData} trueC={TRUE_C} trueR={TRUE_R} />
                </div>
            </div>

            {/* Model info */}
            <div className="glass-card chart-section fade-in fade-in-d3" style={{ marginTop: 20 }}>
                <h2>Model Description</h2>
                <p className="chart-sub" style={{ maxWidth: 'none' }}>
                    The online twin uses a discrete linear RC model: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
                        V[k+1] = a·V[k] + b·I[k]</strong>, where <em>a = 1 − Δt/(RC)</em> and <em>b = Δt/C</em>.
                    The RLS algorithm recursively estimates [a, b] from incoming measurement data,
                    from which the physical parameters C and R are recovered:
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}> C = Δt/b</strong>,
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}> R = b/(1−a)</strong>.
                </p>
                <div className="params-grid" style={{ marginTop: 12 }}>
                    <span className="param-chip">Δt = <strong>{DT} s</strong></span>
                    <span className="param-chip">λ = <strong>0.995</strong></span>
                    <span className="param-chip">C_true = <strong>{TRUE_C} F</strong></span>
                    <span className="param-chip">R_true = <strong>{TRUE_R} Ω</strong></span>
                </div>
            </div>
        </div>
    );
}
