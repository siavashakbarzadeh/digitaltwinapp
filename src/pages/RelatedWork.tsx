import { useState } from 'react';

/* ── Data ── */

interface Approach {
    id: string;
    category: string;
    icon: string;
    color: string;
    title: string;
    shortTitle: string;
    summary: string;
    strengths: string[];
    limitations: string[];
    examples: string[];
    refs: number[];
}

const approaches: Approach[] = [
    {
        id: 'ecm',
        category: '2.1',
        icon: '🔌',
        color: '#00d4ff',
        title: 'Physics-Based Equivalent-Circuit Models',
        shortTitle: 'ECM',
        summary:
            'Equivalent-circuit models are the go-to approach for modeling supercapacitors. They rely on basic circuits made up of resistors and capacitors — set up in one branch or several. Single RC pairs are straightforward, quick to compute, and easy to link back to actual hardware traits, fitting nicely into live systems or small devices.',
        strengths: [
            'Straightforward & easy to implement',
            'Fast computation, suitable for embedded systems',
            'Directly linked to physical hardware traits',
            'Good for real-time control applications',
        ],
        limitations: [
            'Cannot track rapid voltage changes accurately',
            'Struggle with voltage recovery after load shifts',
            'Multi-branch models are hard to parameterize',
            'Parameter values drift with aging and conditions',
        ],
        examples: ['Single RC pair', 'Multi-branch ladder models', 'Nonlinear RC networks'],
        refs: [8, 9],
    },
    {
        id: 'datadriven',
        category: '2.2',
        icon: '🤖',
        color: '#a78bfa',
        title: 'Data-Driven and Deep Learning Approaches',
        shortTitle: 'Data-Driven',
        summary:
            'Data-focused methods like support vector regression, random forests, and LSTMs use real-world patterns to predict voltages. LSTMs excel at tracking temporal patterns across long sequences, making them strong at predicting battery voltage shifts. However, models trained only on data don\'t follow real-world physics rules.',
        strengths: [
            'Excellent at capturing complex nonlinear patterns',
            'LSTMs handle long temporal sequences well',
            'No need for detailed physical knowledge',
            'Strong performance on in-distribution data',
        ],
        limitations: [
            'May violate fundamental physics constraints',
            'Unpredictable behavior outside training distribution',
            'Lack of interpretability and transparency',
            'Require large amounts of quality training data',
        ],
        examples: ['Support Vector Regression', 'Random Forests', 'LSTM Networks', 'GRU Networks'],
        refs: [10, 11],
    },
    {
        id: 'pinn',
        category: '2.3',
        icon: '⚛️',
        color: '#f59e0b',
        title: 'Physics-Informed Neural Networks (PINNs)',
        shortTitle: 'PINNs',
        summary:
            'Physics-Informed Neural Networks embed known physical laws directly into the model\'s training process by adding residuals of governing PDEs to the loss function. Facilitated by automatic differentiation, they enforce physical constraints smoothly. However, gradient pathologies and multi-scale behaviors can stall or destabilize training.',
        strengths: [
            'Embed physical laws into training process',
            'Automatic differentiation for constraint enforcement',
            'Demonstrated success in fluid dynamics',
            'Better generalization than purely data-driven models',
        ],
        limitations: [
            'Gradient pathology — loss imbalance during training',
            'Struggles with multi-scale nonlinear behavior',
            'Simultaneous parameter & weight optimization is unstable',
            'High computational cost from continuous-time formulations',
        ],
        examples: ['PDE-constrained NNs', 'Inverse PINNs', 'Multi-physics PINNs'],
        refs: [14, 15, 17, 18, 19, 20, 21],
    },
    {
        id: 'pirnn',
        category: '2.3',
        icon: '🔄',
        color: '#10b981',
        title: 'Physics-Informed RNNs',
        shortTitle: 'PI-RNN',
        summary:
            'Recurrent architectures guided by physical principles can explicitly encode system dynamics. Dual-branch architectures may use a physics-informed RNN for core dynamics with a parallel network correcting for unrepresented nonlinearities. Despite their promise, many rely on continuous-time formulations requiring numerical differentiation.',
        strengths: [
            'Improved physical plausibility vs purely data-driven',
            'Explicit encoding of system dynamics',
            'Dual-branch correction for unmodeled effects',
            'Better generalization with physical guidance',
        ],
        limitations: [
            'Continuous-time formulations increase compute load',
            'Complex training with adaptive loss weighting',
            'Not suitable for resource-constrained systems',
            'Risk of convergence issues in training',
        ],
        examples: ['Physics-guided LSTMs', 'Dual-branch PI-RNN', 'Constrained GRUs'],
        refs: [24, 25, 26, 27],
    },
    {
        id: 'pilstm',
        category: '2.4',
        icon: '⚡',
        color: '#f43f5e',
        title: 'Proposed PI-LSTM (This Work)',
        shortTitle: 'PI-LSTM',
        summary:
            'The proposed method strikes a practical balance between circuit models, data-driven deep learning, and physics-based neural nets. Physical values are identified ahead of time through evolutionary optimization, then kept separate from LSTM training — avoiding instability. Physics rules are applied step-by-step in sync with sensor data, with no reliance on continuous-time differentiation.',
        strengths: [
            'Decoupled parameter ID avoids co-optimization instability',
            'Discrete-time — no numerical differentiation needed',
            'Combines circuit interpretability with LSTM learning',
            'Stable, fast computation for batch & future live use',
        ],
        limitations: [],
        examples: [
            'Evolutionary parameter fitting (DE)',
            'RC + LSTM surrogate',
            'Step-by-step physics synchronization',
        ],
        refs: [],
    },
];

interface CompRow {
    criterion: string;
    ecm: string;
    datadriven: string;
    pinn: string;
    pilstm: string;
    bestCol: string;
}

const comparison: CompRow[] = [
    {
        criterion: 'Physical Consistency',
        ecm: '✅ High',
        datadriven: '❌ None',
        pinn: '⚠️ Partial',
        pilstm: '✅ High',
        bestCol: 'pilstm',
    },
    {
        criterion: 'Nonlinear Accuracy',
        ecm: '⚠️ Limited',
        datadriven: '✅ High',
        pinn: '✅ High',
        pilstm: '✅ High',
        bestCol: 'pilstm',
    },
    {
        criterion: 'Computational Cost',
        ecm: '✅ Low',
        datadriven: '⚠️ Medium',
        pinn: '❌ High',
        pilstm: '✅ Low',
        bestCol: 'pilstm',
    },
    {
        criterion: 'Training Stability',
        ecm: 'N/A',
        datadriven: '⚠️ Medium',
        pinn: '❌ Low',
        pilstm: '✅ High',
        bestCol: 'pilstm',
    },
    {
        criterion: 'Interpretability',
        ecm: '✅ High',
        datadriven: '❌ Low',
        pinn: '⚠️ Medium',
        pilstm: '✅ High',
        bestCol: 'pilstm',
    },
    {
        criterion: 'Generalization',
        ecm: '⚠️ Limited',
        datadriven: '❌ Poor',
        pinn: '⚠️ Medium',
        pilstm: '✅ Good',
        bestCol: 'pilstm',
    },
    {
        criterion: 'Embedded Deployment',
        ecm: '✅ Easy',
        datadriven: '⚠️ Possible',
        pinn: '❌ Difficult',
        pilstm: '✅ Feasible',
        bestCol: 'pilstm',
    },
];

const references: { num: number; text: string }[] = [
    { num: 7, text: 'Survey of hybrid physics-ML models for energy storage systems' },
    { num: 8, text: 'Single RC equivalent-circuit modeling of supercapacitors' },
    { num: 9, text: 'Multi-branch ladder models for frequency-dependent behavior' },
    { num: 10, text: 'SVR and random forest for voltage estimation' },
    { num: 11, text: 'LSTM-based state-of-charge prediction for batteries' },
    { num: 12, text: 'Hybrid physics-ML framework for electrochemical systems' },
    { num: 13, text: 'Combined physics and data-driven modeling survey' },
    { num: 14, text: 'Raissi et al. — Physics-Informed Neural Networks' },
    { num: 15, text: 'PINN applications in scientific computing' },
    { num: 16, text: 'Automatic differentiation for physics constraints' },
    { num: 17, text: 'PINNs for electrochemical energy storage' },
    { num: 18, text: 'Gradient flow dynamics in PINN training' },
    { num: 19, text: 'Loss imbalance in multi-objective PINN training' },
    { num: 20, text: 'Multi-scale behavior challenges in PINNs' },
    { num: 21, text: 'Battery degradation modeling with PINNs' },
    { num: 22, text: 'Inverse problems in physics-informed learning' },
    { num: 23, text: 'Adaptive weighting for multi-component loss functions' },
    { num: 24, text: 'Physics-informed RNNs for energy systems' },
    { num: 25, text: 'GRU architectures for time-dependent physical systems' },
    { num: 26, text: 'Dual-branch physics-informed neural architectures' },
    { num: 27, text: 'Numerical differentiation costs in PI-RNNs' },
    { num: 28, text: 'Computational constraints in embedded BMS' },
    { num: 29, text: 'Resource-constrained deployment of ML models' },
];

/* ── Component ── */

export default function RelatedWork() {
    const [selectedApproach, setSelectedApproach] = useState<string>('pilstm');
    const [showRefs, setShowRefs] = useState(false);

    const selected = approaches.find((a) => a.id === selectedApproach)!;

    return (
        <div className="fade-in rw-page">
            {/* ── Hero section ── */}
            <h2 className="section-title">Related Work</h2>
            <p className="section-subtitle">
                A taxonomy of supercapacitor voltage modeling approaches — from
                physics-based circuits to data-driven deep learning and hybrid
                physics-informed frameworks. Select a category to explore its
                strengths, limitations, and how the proposed PI‑LSTM method
                addresses existing gaps.
            </p>

            {/* ── Visual Taxonomy ── */}
            <div className="rw-taxonomy glass-card fade-in fade-in-d1">
                <h2>Modeling Taxonomy</h2>
                <p className="chart-sub">
                    Evolution of supercapacitor modeling approaches
                </p>
                <div className="rw-flow">
                    <div className="rw-flow-col">
                        <div className="rw-flow-header" style={{ background: 'rgba(0,212,255,0.08)', borderColor: 'rgba(0,212,255,0.2)' }}>
                            <span className="rw-flow-hicon">📐</span>
                            Physics-Based
                        </div>
                        <div
                            className={`rw-flow-node ${selectedApproach === 'ecm' ? 'active' : ''}`}
                            style={{ '--node-color': '#00d4ff' } as React.CSSProperties}
                            onClick={() => setSelectedApproach('ecm')}
                        >
                            <span className="rw-node-icon">🔌</span>
                            <span>Equivalent Circuit</span>
                            <span className="rw-node-sec">§2.1</span>
                        </div>
                    </div>

                    <div className="rw-flow-connector">
                        <div className="rw-flow-line" />
                        <span className="rw-flow-arrow">→</span>
                    </div>

                    <div className="rw-flow-col">
                        <div className="rw-flow-header" style={{ background: 'rgba(167,139,250,0.08)', borderColor: 'rgba(167,139,250,0.2)' }}>
                            <span className="rw-flow-hicon">📊</span>
                            Data-Driven
                        </div>
                        <div
                            className={`rw-flow-node ${selectedApproach === 'datadriven' ? 'active' : ''}`}
                            style={{ '--node-color': '#a78bfa' } as React.CSSProperties}
                            onClick={() => setSelectedApproach('datadriven')}
                        >
                            <span className="rw-node-icon">🤖</span>
                            <span>ML / Deep Learning</span>
                            <span className="rw-node-sec">§2.2</span>
                        </div>
                    </div>

                    <div className="rw-flow-connector">
                        <div className="rw-flow-line" />
                        <span className="rw-flow-arrow">→</span>
                    </div>

                    <div className="rw-flow-col">
                        <div className="rw-flow-header" style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}>
                            <span className="rw-flow-hicon">🔬</span>
                            Hybrid / PI
                        </div>
                        <div
                            className={`rw-flow-node ${selectedApproach === 'pinn' ? 'active' : ''}`}
                            style={{ '--node-color': '#f59e0b' } as React.CSSProperties}
                            onClick={() => setSelectedApproach('pinn')}
                        >
                            <span className="rw-node-icon">⚛️</span>
                            <span>PINNs</span>
                            <span className="rw-node-sec">§2.3</span>
                        </div>
                        <div
                            className={`rw-flow-node ${selectedApproach === 'pirnn' ? 'active' : ''}`}
                            style={{ '--node-color': '#10b981' } as React.CSSProperties}
                            onClick={() => setSelectedApproach('pirnn')}
                        >
                            <span className="rw-node-icon">🔄</span>
                            <span>PI-RNNs</span>
                            <span className="rw-node-sec">§2.3</span>
                        </div>
                    </div>

                    <div className="rw-flow-connector">
                        <div className="rw-flow-line rw-flow-line-glow" />
                        <span className="rw-flow-arrow rw-flow-arrow-glow">→</span>
                    </div>

                    <div className="rw-flow-col">
                        <div className="rw-flow-header rw-flow-header-proposed" style={{ background: 'rgba(244,63,94,0.08)', borderColor: 'rgba(244,63,94,0.2)' }}>
                            <span className="rw-flow-hicon">⚡</span>
                            Proposed
                        </div>
                        <div
                            className={`rw-flow-node rw-flow-node-proposed ${selectedApproach === 'pilstm' ? 'active' : ''}`}
                            style={{ '--node-color': '#f43f5e' } as React.CSSProperties}
                            onClick={() => setSelectedApproach('pilstm')}
                        >
                            <span className="rw-node-icon">⚡</span>
                            <span>PI-LSTM</span>
                            <span className="rw-node-sec">§2.4</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Approach Detail Card ── */}
            <div
                className="rw-detail glass-card fade-in fade-in-d2"
                style={{ '--detail-color': selected.color } as React.CSSProperties}
                key={selected.id}
            >
                <div className="rw-detail-header">
                    <div className="rw-detail-icon">{selected.icon}</div>
                    <div>
                        <span className="rw-detail-badge" style={{ color: selected.color, background: `${selected.color}18` }}>
                            §{selected.category}
                        </span>
                        <h2>{selected.title}</h2>
                    </div>
                </div>

                <p className="rw-detail-summary">{selected.summary}</p>

                <div className="rw-detail-grid">
                    {/* Strengths */}
                    <div className="rw-detail-list">
                        <h3>
                            <span className="rw-list-icon rw-list-icon-good">✓</span>
                            Strengths
                        </h3>
                        <ul>
                            {selected.strengths.map((s, i) => (
                                <li key={i} className="rw-li-good">{s}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Limitations */}
                    <div className="rw-detail-list">
                        <h3>
                            <span className="rw-list-icon rw-list-icon-bad">✗</span>
                            {selected.id === 'pilstm' ? 'Key Innovations' : 'Limitations'}
                        </h3>
                        {selected.id === 'pilstm' ? (
                            <ul>
                                <li className="rw-li-good">Decoupled evolutionary parameter identification</li>
                                <li className="rw-li-good">Discrete-time physics synchronization</li>
                                <li className="rw-li-good">No automatic / numerical differentiation</li>
                                <li className="rw-li-good">Stable for batch processing & ready for live deployment</li>
                            </ul>
                        ) : (
                            <ul>
                                {selected.limitations.map((l, i) => (
                                    <li key={i} className="rw-li-bad">{l}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Examples & refs */}
                <div className="rw-detail-footer">
                    <div className="rw-examples">
                        <span className="rw-examples-label">Methods:</span>
                        {selected.examples.map((e, i) => (
                            <span key={i} className="param-chip">{e}</span>
                        ))}
                    </div>
                    {selected.refs.length > 0 && (
                        <div className="rw-refs-inline">
                            <span className="rw-examples-label">Refs:</span>
                            {selected.refs.map((r) => (
                                <span key={r} className="rw-ref-badge">[{r}]</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Comparison Table ── */}
            <div className="glass-card chart-section fade-in fade-in-d3">
                <h2>Comparative Analysis</h2>
                <p className="chart-sub">
                    How the proposed PI‑LSTM positions itself against existing paradigms
                </p>
                <div className="rw-table-wrap">
                    <table className="rw-table">
                        <thead>
                            <tr>
                                <th>Criterion</th>
                                <th>
                                    <span className="rw-th-dot" style={{ background: '#00d4ff' }} />
                                    ECM
                                </th>
                                <th>
                                    <span className="rw-th-dot" style={{ background: '#a78bfa' }} />
                                    Data-Driven
                                </th>
                                <th>
                                    <span className="rw-th-dot" style={{ background: '#f59e0b' }} />
                                    PINNs
                                </th>
                                <th className="rw-th-highlight">
                                    <span className="rw-th-dot" style={{ background: '#f43f5e' }} />
                                    PI-LSTM
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparison.map((row, i) => (
                                <tr key={i}>
                                    <td className="rw-td-label">{row.criterion}</td>
                                    <td>{row.ecm}</td>
                                    <td>{row.datadriven}</td>
                                    <td>{row.pinn}</td>
                                    <td className="rw-td-highlight">{row.pilstm}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Key Positioning Statement ── */}
            <div className="rw-positioning glass-card fade-in fade-in-d4">
                <div className="rw-pos-glow" />
                <h2>Positioning of the Proposed Approach</h2>
                <p>
                    The PI‑LSTM method strikes a <strong>practical balance</strong> between
                    traditional circuit models, data-driven deep learning, and physics-based
                    neural networks. Physical values are identified ahead of time through an
                    <em> evolutionary process </em> (Differential Evolution), then kept
                    separate from the network's training phase — avoiding instability issues
                    from co-optimization.
                </p>
                <p>
                    Physics rules are applied <strong>step by step</strong> in sync with
                    actual sensor readings, with <em>no reliance</em> on continuous-time
                    differentiation. By combining clear circuit-based explanations with the
                    strong learning ability of LSTMs while keeping things stable and fast to
                    compute, this approach fits neatly into current research.
                </p>
                <div className="rw-pos-chips">
                    <span className="rw-pos-chip">
                        <span className="rw-pos-chip-icon">🧬</span>
                        Evolutionary Parameter Fitting
                    </span>
                    <span className="rw-pos-chip">
                        <span className="rw-pos-chip-icon">🔗</span>
                        Decoupled Training Pipeline
                    </span>
                    <span className="rw-pos-chip">
                        <span className="rw-pos-chip-icon">📐</span>
                        Discrete-Time Physics
                    </span>
                    <span className="rw-pos-chip">
                        <span className="rw-pos-chip-icon">⚡</span>
                        Batch + Live Ready
                    </span>
                </div>
            </div>

            {/* ── References Toggle ── */}
            <div className="glass-card chart-section fade-in fade-in-d4">
                <button
                    className="rw-refs-toggle"
                    onClick={() => setShowRefs(!showRefs)}
                    id="btn-toggle-refs"
                >
                    <h2 style={{ display: 'inline' }}>References</h2>
                    <span className={`rw-refs-chevron ${showRefs ? 'open' : ''}`}>▾</span>
                </button>
                {showRefs && (
                    <ul className="rw-refs-list fade-in">
                        {references.map((r) => (
                            <li key={r.num}>
                                <span className="rw-ref-num">[{r.num}]</span>
                                {r.text}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
