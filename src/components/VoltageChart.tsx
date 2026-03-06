import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface Props {
    data: { time: number; measured: number; predicted: number; baseline?: number }[];
    measuredColor?: string;
    predictedColor?: string;
    baselineColor?: string;
    measuredLabel?: string;
    predictedLabel?: string;
    baselineLabel?: string;
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
    baselineColor = '#a78bfa',
    measuredLabel = 'Measured',
    predictedLabel = 'PI‑LSTM Predicted',
    baselineLabel = 'LSTM Baseline',
    xLabel = 'Time (s)',
    yLabel = 'Voltage (V)',
}: Props) {
    const hasBaseline = data.length > 0 && data[0].baseline !== undefined;

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
                            name={measuredLabel}
                            stroke={measuredColor}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                        {hasBaseline && (
                            <Line
                                type="monotone"
                                dataKey="baseline"
                                name={baselineLabel}
                                stroke={baselineColor}
                                strokeWidth={1.5}
                                strokeDasharray="8 4"
                                dot={false}
                                isAnimationActive={false}
                            />
                        )}
                        <Line
                            type="monotone"
                            dataKey="predicted"
                            name={predictedLabel}
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
                    {measuredLabel}
                </span>
                {hasBaseline && (
                    <span className="legend-item">
                        <span className="legend-dot" style={{ background: baselineColor }} />
                        {baselineLabel}
                    </span>
                )}
                <span className="legend-item">
                    <span className="legend-dot" style={{ background: predictedColor }} />
                    {predictedLabel}
                </span>
            </div>
        </>
    );
}
