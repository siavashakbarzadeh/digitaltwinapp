import { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { HistoryEntry } from '../types';
import { scenarios } from '../data/scenarios';

interface Props {
    history: HistoryEntry[];
}

export default function ComparisonView({ history }: Props) {
    const [idA, setIdA] = useState<string | null>(history[0]?.id || null);
    const [idB, setIdB] = useState<string | null>(history[1]?.id || null);

    const runA = useMemo(() => history.find(h => h.id === idA), [history, idA]);
    const runB = useMemo(() => history.find(h => h.id === idB), [history, idB]);

    // For simplicity, we'll find the scenario data for visualization
    const dataA = useMemo(() => scenarios.find(s => s.name === runA?.scenarioName && s.condition === runA?.condition && s.assetType === runA?.assetType)?.data || [], [runA]);
    const dataB = useMemo(() => scenarios.find(s => s.name === runB?.scenarioName && s.condition === runB?.condition && s.assetType === runB?.assetType)?.data || [], [runB]);

    const combinedData = useMemo(() => {
        const maxLength = Math.max(dataA.length, dataB.length);
        const result = [];
        for (let i = 0; i < maxLength; i++) {
            result.push({
                time: dataA[i]?.time || dataB[i]?.time || i,
                voltageA: dataA[i]?.measuredVoltage || null,
                voltageB: dataB[i]?.measuredVoltage || null,
            });
        }
        return result;
    }, [dataA, dataB]);

    return (
        <div className="fade-in">
            <div className="comparison-hero glass-card">
                <h2>⚖️ Scenario Comparison</h2>
                <p>Compare performance metrics and voltage profiles across different assets and sessions.</p>
            </div>

            <div className="comparison-selectors">
                <div className="glass-card comp-select-panel">
                    <h3>Run A (Reference)</h3>
                    <select value={idA || ''} onChange={(e) => setIdA(e.target.value)} className="comp-select">
                        <option value="" disabled>Select a run...</option>
                        {history.map(h => (
                            <option key={h.id} value={h.id}>{h.timestamp} - {h.scenarioName} ({h.condition})</option>
                        ))}
                    </select>
                    {runA && (
                        <div className="comp-stats">
                            <div className="comp-stat"><span>MAE</span><strong>{(runA.mae * 1000).toFixed(2)} mV</strong></div>
                            <div className="comp-stat"><span>Health</span><strong>{runA.soh.toFixed(1)}%</strong></div>
                        </div>
                    )}
                </div>

                <div className="glass-card comp-select-panel">
                    <h3>Run B (Target)</h3>
                    <select value={idB || ''} onChange={(e) => setIdB(e.target.value)} className="comp-select">
                        <option value="" disabled>Select a run...</option>
                        {history.map(h => (
                            <option key={h.id} value={h.id}>{h.timestamp} - {h.scenarioName} ({h.condition})</option>
                        ))}
                    </select>
                    {runB && (
                        <div className="comp-stats">
                            <div className="comp-stat"><span>MAE</span><strong>{(runB.mae * 1000).toFixed(2)} mV</strong></div>
                            <div className="comp-stat"><span>Health</span><strong>{runB.soh.toFixed(1)}%</strong></div>
                        </div>
                    )}
                </div>
            </div>

            {runA && runB ? (
                <div className="glass-card chart-section fade-in">
                    <h2>Visual Voltage Comparison</h2>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={combinedData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis domain={['auto', 'auto']} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="voltageA" name={`A: ${runA.scenarioName}`} stroke="#00d4ff" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="voltageB" name={`B: ${runB.scenarioName}`} stroke="#f43f5e" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="glass-card empty-comp fade-in">
                    <p>Select two historical runs to compare their voltage profiles and accuracy metrics side-by-side.</p>
                </div>
            )}
        </div>
    );
}
