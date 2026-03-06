import { useState, useMemo } from 'react';
import { scenarios } from '../data/scenarios';
import { mae, rmse, rSquared } from '../utils/metrics';
import ScenarioCard from '../components/ScenarioCard';
import VoltageChart from '../components/VoltageChart';
import MetricsPanel from '../components/MetricsPanel';

export default function OfflineTwin() {
    const [selectedId, setSelectedId] = useState(scenarios[0].id);

    const scenario = useMemo(
        () => scenarios.find((s) => s.id === selectedId)!,
        [selectedId],
    );

    const chartData = useMemo(
        () =>
            scenario.data.map((d) => ({
                time: d.time,
                measured: d.measuredVoltage,
                predicted: d.predictedVoltage,
            })),
        [scenario],
    );

    const measured = scenario.data.map((d) => d.measuredVoltage);
    const predicted = scenario.data.map((d) => d.predictedVoltage);

    const maeVal = mae(measured, predicted);
    const rmseVal = rmse(measured, predicted);
    const r2Val = rSquared(measured, predicted);

    const metrics = [
        {
            label: 'Mean Absolute Error',
            value: (maeVal * 1000).toFixed(2),
            unit: 'mV',
            color: '#00d4ff',
        },
        {
            label: 'Root Mean Square Error',
            value: (rmseVal * 1000).toFixed(2),
            unit: 'mV',
            color: '#a78bfa',
        },
        {
            label: 'R² Score',
            value: r2Val.toFixed(6),
            unit: '',
            color: '#10b981',
        },
    ];

    return (
        <div className="fade-in">
            <h2 className="section-title">Offline Digital Twin</h2>
            <p className="section-subtitle">
                Component-level digital twin using precomputed laboratory I–V profiles
                and a nonlinear RC + PI‑LSTM surrogate model. Select a current profile
                to compare measured vs. model-predicted voltage.
            </p>

            {/* Scenario selector */}
            <div className="scenario-grid">
                {scenarios.map((s, i) => (
                    <ScenarioCard
                        key={s.id}
                        scenario={s}
                        selected={s.id === selectedId}
                        onClick={() => setSelectedId(s.id)}
                    />
                ))}
            </div>

            {/* Metrics */}
            <MetricsPanel metrics={metrics} />

            {/* Voltage chart */}
            <div className="glass-card chart-section fade-in fade-in-d2">
                <h2>Voltage Time Series — {scenario.name}</h2>
                <p className="chart-sub">
                    Solid: laboratory measurement &nbsp;|&nbsp; Dashed: PI‑LSTM prediction
                </p>
                <VoltageChart
                    data={chartData}
                    measuredColor={scenario.accentColor}
                />
            </div>

            {/* Model parameters */}
            <div className="glass-card chart-section fade-in fade-in-d3">
                <h2>Model Parameters</h2>
                <p className="chart-sub">
                    Nonlinear capacitance model: C(v) = C₀ + K·|v|
                </p>
                <div className="params-grid">
                    <span className="param-chip">
                        C₀ = <strong>{scenario.modelParams.C0} F</strong>
                    </span>
                    <span className="param-chip">
                        K = <strong>{scenario.modelParams.K} F/V</strong>
                    </span>
                    <span className="param-chip">
                        Data points = <strong>{scenario.data.length}</strong>
                    </span>
                    <span className="param-chip">
                        Duration = <strong>{scenario.duration}</strong>
                    </span>
                </div>
            </div>
        </div>
    );
}
