interface Metric {
    label: string;
    value: string;
    unit: string;
    color: string;
}

interface Props {
    metrics: Metric[];
}

export default function MetricsPanel({ metrics }: Props) {
    return (
        <div className="metrics-row">
            {metrics.map((m, i) => (
                <div
                    key={m.label}
                    className={`glass-card metric-card fade-in fade-in-d${i + 1}`}
                    style={{ '--metric-color': m.color } as React.CSSProperties}
                >
                    <div className="metric-label">{m.label}</div>
                    <div className="metric-value">{m.value}</div>
                    <div className="metric-unit">{m.unit}</div>
                </div>
            ))}
        </div>
    );
}
