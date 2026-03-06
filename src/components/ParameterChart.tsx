import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface Props {
    data: { step: number; C: number; R: number }[];
    trueC: number;
    trueR: number;
}

function ParamTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tooltip">
            <div className="tt-label">Step {label}</div>
            {payload.map((p: any) => (
                <div className="tt-row" key={p.dataKey}>
                    <span>
                        <span className="tt-dot" style={{ background: p.color }} />
                        {p.name}
                    </span>
                    <strong style={{ color: p.color }}>{Number(p.value).toFixed(4)}</strong>
                </div>
            ))}
        </div>
    );
}

export default function ParameterChart({ data, trueC, trueR }: Props) {
    return (
        <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 24, bottom: 24, left: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="step"
                        tick={{ fontSize: 11 }}
                        label={{ value: 'Step', position: 'insideBottom', offset: -14, style: { fill: '#64748b', fontSize: 11 } }}
                    />
                    <YAxis
                        yAxisId="C"
                        tick={{ fontSize: 11 }}
                        label={{ value: 'C (F)', angle: -90, position: 'insideLeft', offset: 4, style: { fill: '#64748b', fontSize: 11 } }}
                    />
                    <YAxis
                        yAxisId="R"
                        orientation="right"
                        tick={{ fontSize: 11 }}
                        label={{ value: 'R (Ω)', angle: 90, position: 'insideRight', offset: 4, style: { fill: '#64748b', fontSize: 11 } }}
                    />
                    <Tooltip content={<ParamTooltip />} />
                    {/* reference lines for true values */}
                    <Line
                        yAxisId="C"
                        type="monotone"
                        dataKey={() => trueC}
                        name={`C true (${trueC} F)`}
                        stroke="#00d4ff"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        dot={false}
                        isAnimationActive={false}
                    />
                    <Line
                        yAxisId="C"
                        type="monotone"
                        dataKey="C"
                        name="C estimated"
                        stroke="#00d4ff"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                    <Line
                        yAxisId="R"
                        type="monotone"
                        dataKey={() => trueR}
                        name={`R true (${trueR} Ω)`}
                        stroke="#f59e0b"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        dot={false}
                        isAnimationActive={false}
                    />
                    <Line
                        yAxisId="R"
                        type="monotone"
                        dataKey="R"
                        name="R estimated"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
