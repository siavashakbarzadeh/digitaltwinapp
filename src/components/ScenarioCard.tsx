import { Scenario } from '../data/scenarios';

interface Props {
    scenario: Scenario;
    selected: boolean;
    onClick: () => void;
}

export default function ScenarioCard({ scenario, selected, onClick }: Props) {
    return (
        <div
            className={`glass-card scenario-card ${selected ? 'selected' : ''}`}
            style={{ '--card-accent': scenario.accentColor } as React.CSSProperties}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
        >
            <span className="card-badge">{scenario.profileType}</span>
            <h3>{scenario.name}</h3>
            <p>{scenario.description}</p>
            <div className="card-footer">
                <span>⏱ {scenario.duration}</span>
                <span>📐 {scenario.data.length} pts</span>
            </div>
        </div>
    );
}
