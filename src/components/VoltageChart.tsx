import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface Props {
    data: { time: number; measured: number; predicted: number }[];
    measuredColor?: string;
    predictedColor?: string;
    xLabel?: string;
    yLabel?: string;
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tooltip">
            <div className="tt-label">t = {Number(label).toFixed(1)} s</div>
            {payload.map((p: any) => (
                <div className="tt-row" key={p.dataKey}>
                    <span>
                        <span className="tt-dot" style={{ background: p.color }} />
                        {p.name}
                    </span>
                    <strong style={{ color: p.color }}>{Number(p.value).toFixed(4)} V</strong>
                </div>
            ))}
        </div>
    );
}

export default function VoltageChart({
    data,
    measuredColor = '#00d4ff',
    predictedColor = '#f59e0b',
    xLabel = 'Time (s)',
    yLabel = 'Voltage (V)',
}: Props) {
    return (
        <>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 8, right: 24, bottom: 24, left: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 11 }}
                            label={{ value: xLabel, position: 'insideBottom', offset: -14, style: { fill: '#64748b', fontSize: 11 } }}
                        />
                        <YAxis
                            tick={{ fontSize: 11 }}
                            label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 4, style: { fill: '#64748b', fontSize: 11 } }}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="measured"
                            name="Measured"
                            stroke={measuredColor}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="predicted"
                            name="PI‑LSTM Predicted"
                            stroke={predictedColor}
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="chart-legend">
                <span className="legend-item">
                    <span className="legend-dot" style={{ background: measuredColor }} />
                    Measured
                </span>
                <span className="legend-item">
                    <span className="legend-dot" style={{ background: predictedColor }} />
                    PI‑LSTM Predicted
                </span>
            </div>
        </>
    );
}
