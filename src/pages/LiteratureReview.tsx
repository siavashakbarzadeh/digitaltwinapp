import { useState } from 'react';

/* ═════════════════════════════════════════════════════════
   Literature Review — Full Paper (Sections 1–9)
   ═════════════════════════════════════════════════════════ */

interface SubBase { id: string; num: string; title: string; content?: string }
interface SubBullets extends SubBase { bullets: string[] }
interface SubRoadmap extends SubBase { roadmap: { sec: string; label: string; desc: string }[] }
interface SubComponents extends SubBase {
    threeComponents: { icon: string; label: string; desc: string }[];
    features: { icon: string; label: string; desc: string }[];
}
interface SubTimeline extends SubBase { timeline: { era: string; phase: string; desc: string; color: string }[] }
interface SubDimensions extends SubBase { dimensions: { label: string; items: string[]; color: string }[] }
interface SubTable extends SubBase { table: { headers: string[]; rows: string[][] } }
interface SubCards extends SubBase { cards: { icon: string; label: string; desc: string }[] }
interface SubList extends SubBase { listItems: { label: string; desc: string }[] }

type Sub = SubBase | SubBullets | SubRoadmap | SubComponents | SubTimeline | SubDimensions | SubTable | SubCards | SubList;

interface Section {
    id: string; num: string; icon: string; title: string; color: string;
    content?: string; keywords?: string[]; subsections?: Sub[];
}

const sections: Section[] = [
    /* ═══ Abstract ═══ */
    {
        id: 'abstract', num: '', icon: '📄', title: 'Abstract', color: '#00d4ff',
        content: `Digital twin (DT) technology has emerged as a cornerstone of Industry 4.0 and beyond, enabling real-time monitoring, predictive maintenance, and optimization of complex cyber-physical systems. This comprehensive literature review examines the state of the art in digital twin technologies with particular emphasis on energy storage systems, including batteries, supercapacitors, and thermal storage. The review synthesizes recent advances in physics-based modeling, purely data-driven deep learning approaches, and hybrid physics-informed architectures that combine domain knowledge with machine learning. Special attention is given to physics-informed neural networks (PINNs) and physics-informed recurrent networks (PI‑LSTMs), highlighting how offline training of discrete-time PI‑LSTM models can provide accurate and physically consistent surrogates for energy storage digital twins.`,
        keywords: ['Digital Twin', 'Energy Storage Systems', 'Offline Modeling', 'PI-LSTM', 'Supercapacitors', 'Battery Management', 'Hybrid Modeling', 'PINNs'],
    },

    /* ═══ §1 Introduction ═══ */
    {
        id: 'intro', num: '1', icon: '🎯', title: 'Introduction', color: '#f59e0b',
        subsections: [
            {
                id: 'motivation', num: '1.1', title: 'Motivation and Context',
                content: `The convergence of ubiquitous sensing, high-speed connectivity, cloud computing, and artificial intelligence has catalyzed a paradigm shift in how physical systems are designed, monitored, and optimized. Digital twin (DT) technology has become central to this transformation — originally conceived in aerospace and manufacturing, digital twins now span energy infrastructure, transportation, healthcare, and urban planning.\n\nIn the energy sector, the transition toward renewable sources and distributed generation has intensified the need for accurate models of energy storage systems such as lithium-ion batteries, supercapacitors, and thermal storage units. These devices exhibit complex nonlinear dynamics, aging effects, and sensitivity to operating conditions, making traditional static models insufficient. Digital twins offer a promising framework to integrate physics-based knowledge with data-driven learning [1].`,
            },
            {
                id: 'scope', num: '1.2', title: 'Scope and Objectives',
                bullets: [
                    'Establish a unified definition and conceptual framework for digital twins.',
                    'Review technical architecture, enabling technologies, and implementation platforms.',
                    'Examine modeling paradigms: physics-based, data-driven, and hybrid physics-informed neural networks.',
                    'Analyze energy storage application domains — batteries, supercapacitors, thermal storage.',
                    'Identify challenges: scalability, interoperability, data quality, computational efficiency.',
                    'Position discrete-time PI‑LSTM frameworks for supercapacitor voltage modeling within the DT landscape.',
                ],
            } as SubBullets,
            {
                id: 'organization', num: '1.3', title: 'Organization of the Review',
                roadmap: [
                    { sec: '§2', label: 'Concept & Evolution', desc: 'Definitions, characteristics, history' },
                    { sec: '§3', label: 'Technical Architecture', desc: 'IoT, cloud/edge, AI, simulation' },
                    { sec: '§4', label: 'Taxonomy', desc: 'Scale, lifecycle, synchronization' },
                    { sec: '§5', label: 'Modeling Paradigms', desc: 'Physics, data-driven, hybrid PI‑LSTM' },
                    { sec: '§6', label: 'Application Domains', desc: 'Manufacturing, energy, cities, health' },
                    { sec: '§7', label: 'Challenges', desc: 'Open problems and limitations' },
                    { sec: '§8', label: 'Future Directions', desc: 'Next-gen DT research pathways' },
                    { sec: '§9', label: 'Conclusion', desc: 'Positioning offline PI‑LSTM' },
                ],
            } as SubRoadmap,
        ],
    },

    /* ═══ §2 Concept & Evolution ═══ */
    {
        id: 'concept', num: '2', icon: '🧬', title: 'Concept and Evolution of Digital Twins', color: '#10b981',
        subsections: [
            {
                id: 'definitions', num: '2.1', title: 'Definitions and Core Characteristics',
                content: 'A digital twin is a virtual representation of a physical object, system, or process that is continuously updated with real-world data to reflect the current state and predict future behavior.',
                threeComponents: [
                    { icon: '🏭', label: 'Physical Entity', desc: 'Real-world object + operational context — sensors, actuators, conditions.' },
                    { icon: '💻', label: 'Digital Representation', desc: 'Computational model — CAD to ML — capturing structure, behavior, state.' },
                    { icon: '🔗', label: 'Data Connection', desc: 'Bi-directional digital thread for continuous synchronization.' },
                ],
                features: [
                    { icon: '🔄', label: 'Virtual–Real Mapping', desc: 'Faithfully represents structure and behavior.' },
                    { icon: '⚡', label: 'Real-time Sync', desc: 'Continuous IoT data streaming.' },
                    { icon: '🧬', label: 'Symbiotic Evolution', desc: 'Adapts to degradation and drift.' },
                    { icon: '🎯', label: 'Closed-loop Optimization', desc: 'Predictions inform control strategies.' },
                ],
            } as SubComponents,
            {
                id: 'history', num: '2.2', title: 'Historical Development and Evolution',
                timeline: [
                    { era: 'Pre-2010', phase: 'Simulation & Modeling', desc: 'CAD, FEA, CFD — offline design tools.', color: '#64748b' },
                    { era: '2010–2015', phase: 'IoT-Enabled Monitoring', desc: 'Low-cost sensors + wireless → condition monitoring.', color: '#f59e0b' },
                    { era: '2015–2020', phase: 'Real-time Digital Twins', desc: 'IoT + cloud → state estimation, fault detection.', color: '#00d4ff' },
                    { era: '2020–Present', phase: 'Intelligent & Networked', desc: 'AI, PI-NNs, DT networks, Industry 5.0.', color: '#10b981' },
                ],
            } as SubTimeline,
            {
                id: 'frameworks', num: '2.3', title: 'Conceptual Frameworks',
                dimensions: [
                    { label: 'Time Dimension', items: ['Historical — archiving & post-mortem', 'Real-time — monitoring & control', 'Predictive — forecasting & RUL'], color: '#00d4ff' },
                    { label: 'Space Dimension', items: ['Component (bearing, cell)', 'Asset (motor, battery pack)', 'System (line, microgrid)', 'System-of-systems (city, grid)'], color: '#f59e0b' },
                    { label: 'Logic Dimension', items: ['Descriptive — visualization', 'Diagnostic — anomaly detection', 'Prescriptive — optimization', 'Autonomous — closed-loop'], color: '#10b981' },
                ],
            } as SubDimensions,
        ],
    },

    /* ═══ §3 Technical Architecture ═══ */
    {
        id: 'architecture', num: '3', icon: '🏗️', title: 'Technical Architecture and Enabling Technologies', color: '#a78bfa',
        subsections: [
            {
                id: 'layers', num: '3.1', title: 'Layered Architecture',
                content: 'Modern DT systems are structured as multi-layered architectures separating concerns for modularity and scalability.',
                table: {
                    headers: ['Layer', 'Function and Components'],
                    rows: [
                        ['Physical', 'Assets, sensors, actuators, edge devices for acquisition and preprocessing.'],
                        ['Communication', 'OPC UA, MQTT, 5G, gateways, message queues for low-latency data exchange.'],
                        ['Data', 'Time-series DBs, data lakes; storage, cleaning, transformation, version control.'],
                        ['Model & Simulation', 'Physics (FEA, CFD, circuit), ML (LSTM, CNN), hybrid (PINN, PI-LSTM).'],
                        ['Application', 'Dashboards, AR/VR, APIs (MES/ERP/SCADA); visualization & decision support.'],
                    ],
                },
            } as SubTable,
            {
                id: 'enabling', num: '3.2', title: 'Enabling Technologies',
                cards: [
                    { icon: '📡', label: 'IoT & Connectivity', desc: 'BLE, Zigbee, LoRaWAN, NB-IoT, 5G — edge preprocessing and adaptive sampling.' },
                    { icon: '☁️', label: 'Cloud / Edge / Fog', desc: 'Distributed processing balancing latency, bandwidth, and computation.' },
                    { icon: '🔬', label: 'Physics Simulation', desc: 'FEA, CFD, MBD, circuit simulation; ROM/MOR for real-time surrogates [4].' },
                    { icon: '🤖', label: 'ML & AI', desc: 'Supervised, deep learning (LSTM, CNN), PINNs, RL for control & optimization.' },
                    { icon: '🔧', label: 'Standards', desc: 'OPC UA, AAS, ISO 23247 — platform-independent DT interoperability.' },
                ],
            } as SubCards,
        ],
    },

    /* ═══ §4 Taxonomy ═══ */
    {
        id: 'taxonomy', num: '4', icon: '📐', title: 'Taxonomy of Digital Twin Systems', color: '#f43f5e',
        subsections: [
            {
                id: 'byScale', num: '4.1', title: 'Classification by Scale',
                listItems: [
                    { label: 'Component / Part', desc: 'Bearings, cells, capacitors — component-specific physics.' },
                    { label: 'Asset / System', desc: 'Complete machines — thermal management, power distribution, control.' },
                    { label: 'Process / Line', desc: 'Production lines — workflow, material flow, utilization.' },
                    { label: 'System-of-Systems', desc: 'Factories, grids, cities — network effects, resilience.' },
                ],
            } as SubList,
            {
                id: 'byLifecycle', num: '4.2', title: 'Classification by Lifecycle Stage',
                listItems: [
                    { label: 'Design & Engineering', desc: 'Virtual prototyping, simulation-based optimization.' },
                    { label: 'Manufacturing', desc: 'Virtual commissioning, process optimization, quality control.' },
                    { label: 'Operational', desc: 'Live monitoring, real-time state estimation (SOC, SOH).' },
                    { label: 'Service & Maintenance', desc: 'Optimized intervals, spare parts, lifecycle cost.' },
                    { label: 'End-of-Life', desc: 'Decommissioning, recycling, circular economy strategies.' },
                ],
            } as SubList,
            {
                id: 'bySync', num: '4.3', title: 'Classification by Synchronization Mode',
                listItems: [
                    { label: 'Offline / Batch', desc: 'Periodic updates — post-mortem analysis, design refinement.' },
                    { label: 'Near-Real-Time', desc: 'Seconds-to-minutes — supervisory control, dashboards.' },
                    { label: 'Real-Time', desc: 'Sub-second — closed-loop control, HIL, safety-critical apps.' },
                ],
            } as SubList,
        ],
    },

    /* ═══ §5 Modeling Paradigms ═══ */
    {
        id: 'modeling', num: '5', icon: '🧠', title: 'Modeling Paradigms for Energy Storage DTs', color: '#00d4ff',
        content: 'Three main paradigms employed in digital twins of energy storage systems: physics-based, data-driven, and hybrid physics-informed approaches [5].',
        subsections: [
            {
                id: 'physicsBased', num: '5.1', title: 'Physics-Based Models',
                content: `Physics-based models leverage first-principles knowledge of electrochemical, thermal, and electrical phenomena.\n\n• Electrochemical (P2D / DFN) — high-fidelity but computationally expensive for real-time DTs.\n• Equivalent-Circuit (RC, Thévenin, Randles) — efficient; need frequent recalibration.\n• Thermal & Multiphysics — lumped or FE-based; coupled electro-thermal models [6].`,
            },
            {
                id: 'dataDriven', num: '5.2', title: 'Data-Driven Models',
                content: `Learn mappings from operational data without explicit physics.\n\n• Classical ML — SVR, Random Forests, GPR [7].\n• Deep Learning — LSTMs, GRUs, TCNs for time-series prediction.\n• Attention & Transformers — relevant time-step focus; high compute cost [8].\n\nLimitations: no interpretability, unphysical predictions, limited generalization.`,
            },
            {
                id: 'hybrid', num: '5.3', title: 'Hybrid Physics-Informed Models',
                content: `Combine physics priors with data-driven learning for accuracy + physical consistency.\n\n• PINNs — embed governing PDEs: L = L_data + λ·L_phys.\n• PI-LSTM — recurrent + discrete-time circuit penalty; avoids continuous-time integration.\n• Key advantage: offline training → lightweight deployment as DT surrogate.`,
                cards: [
                    { icon: '🌡️', label: 'PINN Thermal Storage', desc: 'Zeolite-13X: RMSE 0.46K, <3ms inference.' },
                    { icon: '🔋', label: 'LSTM Battery Temp', desc: 'Lumped thermal + LSTM: sub-1°C errors.' },
                    { icon: '📊', label: 'Hierarchical DT', desc: 'TCN-LSTM: <1.1% SOC, <1% SOH/RUL.' },
                    { icon: '🏢', label: 'PINN Smart Building', desc: 'PINN+DRL: 35% cost ↓, 96% comfort.' },
                ],
            } as SubCards & SubBase,
            {
                id: 'piLstmPos', num: '5.4', title: 'Positioning PI-LSTM for Supercapacitors',
                content: `The discrete-time PI‑LSTM framework:\n\n1. RC parameters identified offline via global optimization.\n2. Discrete-time penalty from circuit equations — no continuous integration.\n3. All computation offline; deployment = fast forward evaluation.\n4. Accuracy comparable to complex physics models at fractional cost.\n\nPractical template for lightweight, deployable supercapacitor digital twins.`,
            },
        ],
    },

    /* ═══ §6 Application Domains ═══ */
    {
        id: 'applications', num: '6', icon: '🌍', title: 'Application Domains', color: '#f59e0b',
        subsections: [
            {
                id: 'manufacturing', num: '6.1', title: 'Manufacturing and Industry 4.0/5.0',
                content: `Manufacturing was an early DT adopter — virtual commissioning, predictive maintenance, and production optimization.\n\n• Predictive Maintenance — vibration, temperature, acoustic data with physics + ML; 30–50% reduction in unplanned downtime.\n• Production Line Optimization — what-if analysis of schedules, resources, process parameters.\n• Virtual Commissioning — test control logic in simulation; up to 40% faster commissioning.`,
            },
            {
                id: 'energy', num: '6.2', title: 'Energy and Power Systems',
                cards: [
                    { icon: '🌬️', label: 'Renewable Generation', desc: 'Wind turbine & solar farm twins: SCADA + CFD for wake prediction, yaw control [9].' },
                    { icon: '🔋', label: 'Energy Storage', desc: 'Batteries, supercapacitors, thermal — real-time SOC/SOH, optimal charge/discharge.' },
                    { icon: '⚡', label: 'Smart Grids', desc: 'Power flow, voltage stability, contingency simulation, DER dispatch optimization.' },
                    { icon: '🔌', label: 'Power Electronics', desc: 'Converter DTs for controller design, thermal management, fault diagnosis.' },
                ],
            } as SubCards,
            {
                id: 'cities', num: '6.3', title: 'Smart Cities and Transportation',
                content: `• Smart City Platforms — traffic, air quality, emergency response (Virtual Singapore, City Brain).\n• Transportation — vehicle DTs for predictive maintenance, route optimization; autonomous vehicle simulation for perception/planning/control.`,
            },
            {
                id: 'healthcare', num: '6.4', title: 'Healthcare and Medicine',
                content: `• Medical Device DTs — pacemakers, insulin pumps: remote monitoring, failure prediction [10].\n• Organ & Patient DTs — cardiovascular simulations, personalized treatment, drug response prediction [11].\n• Hospital Operations — patient flow, resource allocation, infection control [12].`,
            },
            {
                id: 'emerging', num: '6.5', title: 'Other Emerging Domains',
                content: 'Agriculture (precision farming), retail (supply chain), finance (risk modeling) — cross-domain applications underscore DT versatility [13].',
            },
        ],
    },

    /* ═══ §7 Challenges ═══ */
    {
        id: 'challenges', num: '7', icon: '⚠️', title: 'Challenges and Open Issues', color: '#f43f5e',
        subsections: [
            {
                id: 'modelingChal', num: '7.1', title: 'Modeling and Calibration',
                listItems: [
                    { label: 'Multi-Scale Complexity', desc: 'Phenomena spanning spatial/temporal scales — integrating without excessive cost.' },
                    { label: 'Parameter Identification', desc: 'Noisy/incomplete data; uncertainty quantification for risk-aware decisions [14].' },
                    { label: 'Accuracy vs. Efficiency', desc: 'Real-time constraints on edge devices; surrogate modeling and hybrid approaches.' },
                ],
            } as SubList,
            {
                id: 'dataChal', num: '7.2', title: 'Data Quality and Integration',
                listItems: [
                    { label: 'Availability & Coverage', desc: 'Sparse, imbalanced, or proprietary data limiting generalization.' },
                    { label: 'Noise & Quality', desc: 'Sensor drift, outliers, missing values; preprocessing essential.' },
                    { label: 'Heterogeneous Integration', desc: 'Fusing disparate sources with temporal/semantic alignment.' },
                ],
            } as SubList,
            {
                id: 'scaleChal', num: '7.3', title: 'Scalability and Interoperability',
                listItems: [
                    { label: 'Large-Scale Systems', desc: 'Managing thousands of twins — hierarchical architectures, orchestration.' },
                    { label: 'Standards Gaps', desc: 'OPC UA, AAS, ISO 23247 provide partial solutions; full interop remains open.' },
                ],
            } as SubList,
            {
                id: 'trustChal', num: '7.4', title: 'Trustworthiness and Validation',
                listItems: [
                    { label: 'V&V', desc: 'Rigorous validation against experiments; formal verification for safety-critical [15].' },
                    { label: 'Explainability', desc: 'Black-box limitations; physics-informed models improve interpretability.' },
                    { label: 'Cybersecurity', desc: 'Bi-directional channels create vulnerabilities; secure-by-design needed [16].' },
                ],
            } as SubList,
            {
                id: 'humanChal', num: '7.5', title: 'Human Factors and Ethics',
                content: `• Human-in-the-Loop — Industry 5.0 emphasizes augmentation over replacement; trust, over-reliance, collaborative workflows.\n• Ethics — consent, data ownership, algorithmic fairness; governance and regulatory guardrails [17].`,
            },
        ],
    },

    /* ═══ §8 Future Directions ═══ */
    {
        id: 'future', num: '8', icon: '🚀', title: 'Future Research Directions', color: '#10b981',
        subsections: [
            {
                id: 'autonomous', num: '8.1', title: 'Intelligent and Autonomous DTs',
                content: 'Continual learning, meta-learning, and RL for self-evolving twins that adapt without human intervention.',
            },
            {
                id: 'networked', num: '8.2', title: 'Networked and Collaborative DTs',
                content: 'Twin-to-twin communication, federated learning, privacy-preserving data exchange for system-of-systems [18].',
            },
            {
                id: 'advancedPI', num: '8.3', title: 'Advanced Physics-Informed Architectures',
                listItems: [
                    { label: 'Adaptive Weighting', desc: 'Dynamic balance between data-fitting and physics-penalty terms.' },
                    { label: 'Discrete-Time / Neural Operators', desc: 'Fourier neural operators, DeepONet — fast inference without continuous-time overhead.' },
                    { label: 'Multi-Fidelity Modeling', desc: 'Low-fidelity surrogates for real-time + periodic high-fidelity validation.' },
                ],
            } as SubList,
            {
                id: 'edge', num: '8.4', title: 'Edge and Embedded DTs',
                content: 'Deployment on BMS, controllers, IoT gateways — quantization, pruning, knowledge distillation, FPGA acceleration [19].',
            },
            {
                id: 'sustainability', num: '8.5', title: 'DTs for Sustainability & Circular Economy',
                content: 'Optimize energy consumption, minimize waste, track material provenance and residual value [20].',
            },
            {
                id: 'humanCentered', num: '8.6', title: 'Human-Centered Design',
                content: 'Industry 5.0 principles — well-being, accessibility, inclusivity, collaborative decision-making.',
            },
            {
                id: 'standards', num: '8.7', title: 'Standardization and Certification',
                content: 'ISO, IEC, IEEE collaboration for DT development, validation, and certification in regulated industries.',
            },
        ],
    },

    /* ═══ §9 Conclusions ═══ */
    {
        id: 'conclusion', num: '9', icon: '🏁', title: 'Positioning of the Present Work and Conclusions', color: '#a78bfa',
        subsections: [
            {
                id: 'positioning', num: '9.1', title: 'Positioning of the PI-LSTM Framework',
                content: `The PI‑LSTM framework occupies a middle ground between purely physics-based and purely data-driven approaches. By embedding discrete-time circuit equations into the LSTM training objective, the method enforces physical consistency while retaining recurrent flexibility for nonlinear and history-dependent supercapacitor dynamics.\n\nA key contribution is the explicit offline workflow: parameter identification and PI‑LSTM training are performed entirely on historical datasets. The resulting physics-consistent surrogate can be embedded into DT workflows without online retraining, simplifying implementation on resource-constrained hardware [21].`,
            },
            {
                id: 'implications', num: '9.2', title: 'Broader Implications',
                content: `• Hybrid models are particularly suited where both accuracy and physical consistency are critical.\n• Discrete-time formulations + circuit priors = favorable fidelity–cost balance, compatible with existing toolchains.\n• Separating model development from runtime execution simplifies validation, benchmarking, and versioning.\n\nFor energy storage, this offline-centric workflow provides a clear path toward trustworthy, maintainable digital twins.`,
            },
            {
                id: 'conclusions', num: '9.3', title: 'Conclusions',
                content: `Digital twin technology has matured from a visionary concept to a practical enabler of Industry 4.0, smart energy systems, and intelligent infrastructure. Effective DTs rest on a foundation of enabling technologies (IoT, cloud/edge, AI), structured architectures, and rigorous modeling.\n\nIn energy storage — critical for decarbonization — the discrete-time PI‑LSTM framework represents a promising approach to accuracy, efficiency, and trustworthiness. The landscape will continue evolving toward greater intelligence, autonomy, and interconnection — requiring sustained interdisciplinary collaboration and continued innovation in modeling, validation, and deployment.`,
            },
        ],
    },
];

/* ────────────────────── */
function useExpanded() {
    const init: Record<string, boolean> = {};
    sections.forEach((s) => { init[s.id] = true; s.subsections?.forEach((sub) => { init[sub.id] = true; }); });
    const [open, setOpen] = useState<Record<string, boolean>>(init);
    const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !p[id] }));
    return { open, toggle };
}

/* ═════════════ COMPONENT ═════════════ */
export default function LiteratureReview() {
    const { open, toggle } = useExpanded();

    return (
        <div className="lr-page">
            {/* Hero */}
            <div className="lr-hero glass-card fade-in">
                <div className="lr-hero-icon">📚</div>
                <h1 className="lr-hero-title">Digital Twins for Energy Storage Systems</h1>
                <p className="lr-hero-sub">A Comprehensive Review with Emphasis on Offline Physics‑Informed LSTM Modeling</p>
                <div className="lr-hero-tags">
                    {['Literature Review', 'Digital Twin', 'PI-LSTM', 'Energy Storage', 'Supercapacitors'].map((t) => (
                        <span key={t} className="lr-tag">{t}</span>
                    ))}
                </div>
            </div>

            {/* Sections */}
            {sections.map((sec, si) => (
                <div key={sec.id} className={`lr-section glass-card fade-in fade-in-d${Math.min(si + 1, 8)}`}>
                    <button className="lr-sec-header" onClick={() => toggle(sec.id)}
                        style={{ '--sec-color': sec.color } as React.CSSProperties}>
                        <span className="lr-sec-icon" style={{ background: `${sec.color}18`, borderColor: `${sec.color}30` }}>{sec.icon}</span>
                        <span className="lr-sec-num">{sec.num ? `§${sec.num}` : ''}</span>
                        <span className="lr-sec-title">{sec.title}</span>
                        <span className={`lr-chevron ${open[sec.id] ? 'open' : ''}`}>▾</span>
                    </button>

                    {open[sec.id] && (
                        <div className="lr-sec-body">
                            {sec.content && <div className="lr-text">{sec.content.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</div>}
                            {sec.keywords && (
                                <div className="lr-keywords">
                                    <span className="lr-kw-label">Keywords:</span>
                                    {sec.keywords.map((kw) => <span key={kw} className="lr-kw">{kw}</span>)}
                                </div>
                            )}

                            {sec.subsections?.map((sub) => (
                                <div key={sub.id} className="lr-subsection">
                                    <button className="lr-sub-header" onClick={() => toggle(sub.id)}>
                                        <span className="lr-sub-num">{sub.num}</span>
                                        <span className="lr-sub-title">{sub.title}</span>
                                        <span className={`lr-chevron small ${open[sub.id] ? 'open' : ''}`}>▾</span>
                                    </button>

                                    {open[sub.id] && (
                                        <div className="lr-sub-body">
                                            {sub.content && <div className="lr-text">{sub.content.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</div>}

                                            {'bullets' in sub && sub.bullets && (
                                                <ol className="lr-objectives">{sub.bullets.map((b: string, i: number) => (
                                                    <li key={i}><span className="lr-obj-num">{i + 1}</span>{b}</li>
                                                ))}</ol>
                                            )}

                                            {'roadmap' in sub && sub.roadmap && (
                                                <div className="lr-roadmap">{sub.roadmap.map((r: { sec: string; label: string; desc: string }, i: number) => (
                                                    <div key={i} className="lr-roadmap-item">
                                                        <span className="lr-roadmap-sec">{r.sec}</span>
                                                        <div><strong>{r.label}</strong><p>{r.desc}</p></div>
                                                    </div>
                                                ))}</div>
                                            )}

                                            {'threeComponents' in sub && sub.threeComponents && (
                                                <div className="lr-three-grid">{sub.threeComponents.map((c: { icon: string; label: string; desc: string }, i: number) => (
                                                    <div key={i} className="lr-comp-card glass-card">
                                                        <span className="lr-comp-icon">{c.icon}</span>
                                                        <strong>{c.label}</strong><p>{c.desc}</p>
                                                    </div>
                                                ))}</div>
                                            )}

                                            {'features' in sub && sub.features && (
                                                <div className="lr-features">
                                                    <h4 className="lr-features-label">Key Technical Features</h4>
                                                    <div className="lr-feat-grid">{sub.features.map((f: { icon: string; label: string; desc: string }, i: number) => (
                                                        <div key={i} className="lr-feat">
                                                            <span className="lr-feat-icon">{f.icon}</span>
                                                            <div><strong>{f.label}</strong><p>{f.desc}</p></div>
                                                        </div>
                                                    ))}</div>
                                                </div>
                                            )}

                                            {'timeline' in sub && sub.timeline && (
                                                <div className="lr-timeline">{sub.timeline.map((t: { era: string; phase: string; desc: string; color: string }, i: number) => (
                                                    <div key={i} className="lr-tl-item" style={{ '--tl-color': t.color } as React.CSSProperties}>
                                                        <div className="lr-tl-dot" />
                                                        <div className="lr-tl-content">
                                                            <span className="lr-tl-era">{t.era}</span>
                                                            <strong>{t.phase}</strong><p>{t.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}</div>
                                            )}

                                            {'dimensions' in sub && sub.dimensions && (
                                                <div className="lr-dim-grid">{sub.dimensions.map((d: { label: string; items: string[]; color: string }, i: number) => (
                                                    <div key={i} className="lr-dim-card glass-card" style={{ '--dim-color': d.color } as React.CSSProperties}>
                                                        <h4 style={{ color: d.color }}>{d.label}</h4>
                                                        <ul>{d.items.map((item: string, j: number) => <li key={j}>{item}</li>)}</ul>
                                                    </div>
                                                ))}</div>
                                            )}

                                            {'table' in sub && sub.table && (
                                                <div className="rw-table-wrap" style={{ marginTop: 16 }}>
                                                    <table className="rw-table">
                                                        <thead><tr>{sub.table.headers.map((h: string, i: number) => <th key={i}>{h}</th>)}</tr></thead>
                                                        <tbody>{sub.table.rows.map((row: string[], ri: number) => (
                                                            <tr key={ri}>{row.map((cell: string, ci: number) => <td key={ci}>{cell}</td>)}</tr>
                                                        ))}</tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {'cards' in sub && sub.cards && (
                                                <div className="lr-cards-grid">{sub.cards.map((c: { icon: string; label: string; desc: string }, i: number) => (
                                                    <div key={i} className="lr-info-card glass-card">
                                                        <span className="lr-card-icon">{c.icon}</span>
                                                        <strong>{c.label}</strong><p>{c.desc}</p>
                                                    </div>
                                                ))}</div>
                                            )}

                                            {'listItems' in sub && sub.listItems && (
                                                <div className="lr-list">{sub.listItems.map((li: { label: string; desc: string }, i: number) => (
                                                    <div key={i} className="lr-list-item">
                                                        <span className="lr-list-bullet">{i + 1}</span>
                                                        <div><strong>{li.label}</strong><p>{li.desc}</p></div>
                                                    </div>
                                                ))}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {/* References */}
            <div className="lr-section glass-card fade-in fade-in-d4">
                <div className="lr-sec-body" style={{ padding: '22px 28px' }}>
                    <h3 style={{ fontSize: '0.85rem', marginBottom: 12, color: 'var(--text-primary)' }}>📎 References</h3>
                    <ol className="lr-refs">
                        <li>[1] Grieves & Vickers, "Digital Twin: Mitigating Emergent Behavior," Springer, 2017.</li>
                        <li>[2] Tao et al., "Digital twin in industry: State-of-the-art," IEEE TII, 2019.</li>
                        <li>[3] Jones et al., "Characterising the Digital Twin," CIRP Journal, 2020.</li>
                        <li>[4] Rasheed et al., "Digital Twin: Values, Challenges, Enablers," IEEE Access, 2020.</li>
                        <li>[5] Wagg et al., "Digital Twins: State of the Art," ASCE-ASME J., 2020.</li>
                        <li>[6] Jossen, "Fundamentals of battery dynamics," J. Power Sources, 2006.</li>
                        <li>[7] Lipu et al., "SOH and RUL estimation review," J. Cleaner Prod., 2018.</li>
                        <li>[8] Vaswani et al., "Attention Is All You Need," NeurIPS, 2017.</li>
                        <li>[9] Tao et al., "Digital twin-driven product design," J. Manufacturing Systems, 2018.</li>
                        <li>[10] Corral-Acero et al., "Digital twin of the human heart," European Heart J., 2020.</li>
                        <li>[11] Hernandez-Boussard et al., "Digital twins for predictive oncology," Nature Medicine, 2021.</li>
                        <li>[12] Karakra et al., "Hospital DT for patient flow," J. Medical Systems, 2022.</li>
                        <li>[13] Fuller et al., "Digital Twin: Enabling Technologies," IEEE Access, 2020.</li>
                        <li>[14] VanDerHorn & Mahadevan, "DT uncertainty quantification," ASCE-ASME J., 2021.</li>
                        <li>[15] Kapteyn et al., "Predictive DT via component-based model reduction," CMAME, 2021.</li>
                        <li>[16] Eckhart & Ekelhart, "DT security challenges," CIRED Workshop, 2019.</li>
                        <li>[17] Bruynseels et al., "Digital Twins in healthcare: ethical implications," Am. J. Bioethics, 2018.</li>
                        <li>[18] Boje et al., "Towards a semantic Construction DT," Automation in Construction, 2020.</li>
                        <li>[19] Li et al., "Edge intelligence for industrial DT," IEEE Network, 2021.</li>
                        <li>[20] Pham et al., "DTs for circular economy," J. Cleaner Production, 2022.</li>
                        <li>[21] Present work — PI-LSTM framework for supercapacitor voltage modeling.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
