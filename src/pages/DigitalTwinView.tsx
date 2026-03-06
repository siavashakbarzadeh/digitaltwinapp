import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { scenarios } from '../data/scenarios';
import { mae, rmse, rSquared } from '../utils/metrics';
import VoltageChart from '../components/VoltageChart';

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
        () => scenarios.find((s) => s.id === selectedScenarioId) ?? scenarios[0],
        [selectedScenarioId]
    );

    /* Chart data */
    const voltageData = useMemo(() =>
        scenario.data.map((d) => ({
            time: d.time,
            measured: d.measuredVoltage,
            baseline: d.lstmVoltage,
            predicted: d.piLstmVoltage,
        })),
        [scenario]
    );

    const currentData = useMemo(() =>
        scenario.data.map((d) => ({
            time: d.time,
            current: d.current,
        })),
        [scenario]
    );

    const socData = useMemo(() =>
        scenario.data.map((d) => ({
            time: d.time,
            measuredSOC: voltageToSOC(d.measuredVoltage),
            modelSOC: voltageToSOC(d.piLstmVoltage),
        })),
        [scenario]
    );

    const errorData = useMemo(() =>
        scenario.data.map((d) => ({
            time: d.time,
            lstmError: (d.lstmVoltage - d.measuredVoltage) * 1000,
            piLstmError: (d.piLstmVoltage - d.measuredVoltage) * 1000,
        })),
        [scenario]
    );

    /* Metrics */
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

            {/* ── Voltage Chart ── */}
            <div className="glass-card chart-section fade-in fade-in-d2">
                <h2>Voltage Reconstruction</h2>
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
