import React, { useState, useEffect } from 'react';

/* ═════════════════════════════════════════════════════════
   Literature Review — Full Paper (§1–§9)
   Rich visuals, animated diagrams, particle effects
   ═════════════════════════════════════════════════════════ */

/* ── types ── */
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
interface SubStats extends SubBase { stats: { value: string; label: string; color: string }[] }
interface SubFlow extends SubBase { flow: { icon: string; label: string; color: string }[] }

type Sub = SubBase | SubBullets | SubRoadmap | SubComponents | SubTimeline | SubDimensions
    | SubTable | SubCards | SubList | SubStats | SubFlow;

interface Section {
    id: string; num: string; icon: string; title: string; color: string;
    content?: string; keywords?: string[]; subsections?: Sub[];
}

/* ═══════════ SECTION DATA ═══════════ */
const sections: Section[] = [
    /* Abstract */
    {
        id: 'abstract', num: '', icon: '📄', title: 'Abstract', color: '#00d4ff',
        content: `Digital twin (DT) technology has emerged as a cornerstone of Industry 4.0 and beyond, enabling real-time monitoring, predictive maintenance, and optimization of complex cyber-physical systems. This comprehensive literature review examines the state of the art in digital twin technologies with particular emphasis on energy storage systems, including batteries, supercapacitors, and thermal storage. The review synthesizes recent advances in physics-based modeling, purely data-driven deep learning approaches, and hybrid physics-informed architectures that combine domain knowledge with machine learning. Special attention is given to physics-informed neural networks (PINNs) and physics-informed recurrent networks (PI‑LSTMs), highlighting how offline training of discrete-time PI‑LSTM models can provide accurate and physically consistent surrogates for energy storage digital twins.`,
        keywords: ['Digital Twin', 'Energy Storage Systems', 'Offline Modeling', 'PI-LSTM', 'Supercapacitors', 'Battery Management', 'Hybrid Modeling', 'PINNs'],
    },

    /* §1 Introduction */
    {
        id: 'intro', num: '1', icon: '🎯', title: 'Introduction', color: '#f59e0b',
        subsections: [
            {
                id: 'motivation', num: '1.1', title: 'Motivation and Context',
                content: `The convergence of ubiquitous sensing, high-speed connectivity, cloud computing, and artificial intelligence has catalyzed a paradigm shift in how physical systems are designed, monitored, and optimized. Digital twin (DT) technology has become central to this transformation — originally conceived in aerospace and manufacturing, digital twins now span energy infrastructure, transportation, healthcare, and urban planning.\n\nIn the energy sector, the transition toward renewable sources and distributed generation has intensified the need for accurate models of energy storage systems such as lithium-ion batteries, supercapacitors, and thermal storage units. These devices exhibit complex nonlinear dynamics, aging effects, and sensitivity to operating conditions, making traditional static models insufficient [1].`,
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

    /* §2 Concept & Evolution */
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

    /* §3 Technical Architecture */
    {
        id: 'architecture', num: '3', icon: '🏗️', title: 'Technical Architecture and Enabling Technologies', color: '#a78bfa',
        subsections: [
            {
                id: 'layers', num: '3.1', title: 'Five-Layer Architecture',
                content: 'Modern DT systems are structured as multi-layered architectures separating concerns for modularity and scalability.',
                flow: [
                    { icon: '📡', label: 'Physical Layer', color: '#f43f5e' },
                    { icon: '🌐', label: 'Communication', color: '#f59e0b' },
                    { icon: '💾', label: 'Data Layer', color: '#00d4ff' },
                    { icon: '🧠', label: 'Model & Sim', color: '#a78bfa' },
                    { icon: '📊', label: 'Application', color: '#10b981' },
                ],
            } as SubFlow,
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

    /* §4 Taxonomy */
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

    /* §5 Modeling Paradigms */
    {
        id: 'modeling', num: '5', icon: '🧠', title: 'Modeling Paradigms for Energy Storage DTs', color: '#00d4ff',
        content: 'Three main paradigms employed in digital twins of energy storage systems [5].',
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
                content: `Combine physics priors with data-driven learning:\n\n• PINNs — embed governing PDEs: L = L_data + λ·L_phys.\n• PI-LSTM — recurrent + discrete-time circuit penalty.\n• Offline training → lightweight deployment as DT surrogate.`,
                cards: [
                    { icon: '🌡️', label: 'PINN Thermal Storage', desc: 'Zeolite-13X: RMSE 0.46K, <3ms inference.' },
                    { icon: '🔋', label: 'LSTM Battery Temp', desc: 'Lumped thermal + LSTM: sub-1°C errors.' },
                    { icon: '📊', label: 'Hierarchical DT', desc: 'TCN-LSTM: <1.1% SOC, <1% SOH/RUL.' },
                    { icon: '🏢', label: 'PINN Smart Building', desc: 'PINN+DRL: 35% cost ↓, 96% comfort.' },
                ],
            } as SubCards & SubBase,
            {
                id: 'piLstmPos', num: '5.4', title: 'Positioning PI-LSTM for Supercapacitors',
                content: `The discrete-time PI‑LSTM framework:\n\n1. RC parameters identified offline via global optimization.\n2. Discrete-time penalty from circuit equations — no continuous integration.\n3. All computation offline; deployment = fast forward evaluation.\n4. Accuracy comparable to complex physics models at fractional cost.`,
                stats: [
                    { value: '3-Stage', label: 'Architecture', color: '#00d4ff' },
                    { value: '<1%', label: 'RMSE Voltage', color: '#10b981' },
                    { value: '~500s', label: 'Train/Epoch', color: '#f59e0b' },
                    { value: 'Offline', label: 'Deployment', color: '#a78bfa' },
                ],
            } as SubStats & SubBase,
        ],
    },

    /* §6 Application Domains */
    {
        id: 'applications', num: '6', icon: '🌍', title: 'Application Domains', color: '#f59e0b',
        subsections: [
            {
                id: 'manufacturing', num: '6.1', title: 'Manufacturing and Industry 4.0/5.0',
                stats: [
                    { value: '30-50%', label: 'Downtime Reduction', color: '#10b981' },
                    { value: '40%', label: 'Faster Commissioning', color: '#00d4ff' },
                    { value: '∞', label: 'What-if Scenarios', color: '#f59e0b' },
                ],
                content: `Manufacturing was an early DT adopter — virtual commissioning, predictive maintenance, and production optimization.\n\n• Predictive Maintenance — vibration, temperature, acoustic data with physics + ML.\n• Production Line Optimization — what-if analysis of schedules, resources.\n• Virtual Commissioning — test control logic in simulation before deployment.`,
            } as SubStats & SubBase,
            {
                id: 'energy', num: '6.2', title: 'Energy and Power Systems',
                cards: [
                    { icon: '🌬️', label: 'Renewable Generation', desc: 'Wind turbine & solar farm twins: SCADA + CFD for wake prediction [9].' },
                    { icon: '🔋', label: 'Energy Storage', desc: 'Batteries, supercapacitors, thermal — real-time SOC/SOH, charge/discharge.' },
                    { icon: '⚡', label: 'Smart Grids', desc: 'Power flow, voltage stability, DER dispatch optimization.' },
                    { icon: '🔌', label: 'Power Electronics', desc: 'Converter DTs for controller design, thermal management.' },
                ],
            } as SubCards,
            {
                id: 'cities', num: '6.3', title: 'Smart Cities and Transportation',
                content: `• Smart City Platforms — traffic, air quality, emergency response (Virtual Singapore, City Brain).\n• Transportation — vehicle DTs for predictive maintenance; autonomous vehicle simulation.`,
            },
            {
                id: 'healthcare', num: '6.4', title: 'Healthcare and Medicine',
                content: `• Medical Device DTs — pacemakers, insulin pumps: remote monitoring [10].\n• Organ & Patient DTs — cardiovascular simulations, personalized treatment [11].\n• Hospital Operations — patient flow, resource allocation [12].`,
            },
            {
                id: 'emerging', num: '6.5', title: 'Other Emerging Domains',
                content: 'Agriculture (precision farming), retail (supply chain), finance (risk modeling) — cross-domain DT versatility [13].',
            },
        ],
    },

    /* §7 Challenges */
    {
        id: 'challenges', num: '7', icon: '⚠️', title: 'Challenges and Open Issues', color: '#f43f5e',
        subsections: [
            {
                id: 'modelingChal', num: '7.1', title: 'Modeling and Calibration',
                listItems: [
                    { label: 'Multi-Scale Complexity', desc: 'Integrating across spatial/temporal scales without excessive cost.' },
                    { label: 'Parameter Identification', desc: 'Noisy/incomplete data; uncertainty quantification [14].' },
                    { label: 'Accuracy vs. Efficiency', desc: 'Real-time constraints on edge devices; surrogate modeling.' },
                ],
            } as SubList,
            {
                id: 'dataChal', num: '7.2', title: 'Data Quality and Integration',
                listItems: [
                    { label: 'Availability & Coverage', desc: 'Sparse, imbalanced, or proprietary data.' },
                    { label: 'Noise & Quality', desc: 'Sensor drift, outliers, missing values.' },
                    { label: 'Heterogeneous Integration', desc: 'Fusing disparate sources with alignment.' },
                ],
            } as SubList,
            {
                id: 'scaleChal', num: '7.3', title: 'Scalability and Interoperability',
                listItems: [
                    { label: 'Large-Scale Systems', desc: 'Managing thousands of twins — hierarchical architectures.' },
                    { label: 'Standards Gaps', desc: 'OPC UA, AAS, ISO 23247 — partial solutions.' },
                ],
            } as SubList,
            {
                id: 'trustChal', num: '7.4', title: 'Trustworthiness and Validation',
                listItems: [
                    { label: 'V&V', desc: 'Rigorous validation; formal verification for safety-critical [15].' },
                    { label: 'Explainability', desc: 'Black-box limitations; PI models improve interpretability.' },
                    { label: 'Cybersecurity', desc: 'Bi-directional channels create vulnerabilities [16].' },
                ],
            } as SubList,
            {
                id: 'humanChal', num: '7.5', title: 'Human Factors and Ethics',
                content: `• Human-in-the-Loop — Industry 5.0 augmentation; trust and collaborative workflows.\n• Ethics — consent, data ownership, algorithmic fairness; governance [17].`,
            },
        ],
    },

    /* §8 Future Directions */
    {
        id: 'future', num: '8', icon: '🚀', title: 'Future Research Directions', color: '#10b981',
        subsections: [
            {
                id: 'autonomous', num: '8.1', title: 'Intelligent and Autonomous DTs',
                content: 'Continual learning, meta-learning, and RL for self-evolving twins.',
            },
            {
                id: 'networked', num: '8.2', title: 'Networked and Collaborative DTs',
                content: 'Twin-to-twin communication, federated learning, privacy-preserving exchange [18].',
            },
            {
                id: 'advancedPI', num: '8.3', title: 'Advanced Physics-Informed Architectures',
                listItems: [
                    { label: 'Adaptive Weighting', desc: 'Dynamic balance between data-fitting and physics-penalty.' },
                    { label: 'Neural Operators', desc: 'Fourier neural operators, DeepONet — fast inference.' },
                    { label: 'Multi-Fidelity', desc: 'Low-fidelity surrogates + periodic high-fidelity validation.' },
                ],
            } as SubList,
            {
                id: 'edge', num: '8.4', title: 'Edge and Embedded DTs',
                content: 'Deployment on BMS, controllers, IoT gateways — quantization, pruning, FPGA [19].',
            },
            {
                id: 'sustainability', num: '8.5', title: 'DTs for Sustainability & Circular Economy',
                content: 'Optimize energy, minimize waste, track material provenance [20].',
            },
            {
                id: 'humanCentered', num: '8.6', title: 'Human-Centered Design',
                content: 'Industry 5.0 — well-being, accessibility, collaborative decision-making.',
            },
            {
                id: 'stds', num: '8.7', title: 'Standardization and Certification',
                content: 'ISO, IEC, IEEE for DT development, validation, certification.',
            },
        ],
    },

    /* §9 Conclusion */
    {
        id: 'conclusion', num: '9', icon: '🏁', title: 'Positioning & Conclusions', color: '#a78bfa',
        subsections: [
            {
                id: 'positioning', num: '9.1', title: 'Positioning of the PI-LSTM Framework',
                content: `The PI‑LSTM occupies a middle ground between purely physics-based and data-driven approaches. By embedding discrete-time circuit equations into the LSTM training objective, the method enforces physical consistency while retaining recurrent flexibility.\n\nKey contribution: explicit offline workflow — parameter identification and PI‑LSTM training on historical datasets; deployment without online retraining [21].`,
            },
            {
                id: 'implications', num: '9.2', title: 'Broader Implications',
                content: `• Hybrid models are suited where accuracy and physical consistency are both critical.\n• Discrete-time + circuit priors = favorable fidelity–cost balance.\n• Separating development from runtime simplifies validation and versioning.`,
            },
            {
                id: 'conclusions', num: '9.3', title: 'Conclusions',
                content: `Digital twin technology has matured from vision to practical enabler of Industry 4.0, smart energy, and intelligent infrastructure. The discrete-time PI‑LSTM framework represents a promising path to accuracy, efficiency, and trustworthiness for energy storage DTs.`,
            },
        ],
    },
];

/* ── Animated counter hook ── */
function useCounter(target: number, duration = 2000) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = target / (duration / 16);
        const id = setInterval(() => {
            start += step;
            if (start >= target) { setVal(target); clearInterval(id); }
            else setVal(Math.floor(start));
        }, 16);
        return () => clearInterval(id);
    }, [target, duration]);
    return val;
}

/* ── Floating particles ── */
function Particles() {
    return (
        <div className="lr-particles">
            {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="lr-particle" style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 6}s`,
                    animationDuration: `${4 + Math.random() * 6}s`,
                    width: `${2 + Math.random() * 4}px`,
                    height: `${2 + Math.random() * 4}px`,
                    opacity: 0.15 + Math.random() * 0.25,
                }} />
            ))}
        </div>
    );
}

/* ── Animated neural network SVG ── */
function NeuralNetworkSVG() {
    const layers = [3, 5, 5, 3];
    const w = 280, h = 140;
    const lx = layers.map((_: number, i: number) => 40 + i * ((w - 80) / (layers.length - 1)));
    return (
        <svg className="lr-nn-svg" viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: 340 }}>
            {/* connections */}
            {layers.map((count: number, li: number) => {
                if (li === layers.length - 1) return null;
                const nextCount = layers[li + 1];
                return Array.from({ length: count }).map((_, ni) => {
                    const y1 = (h / (count + 1)) * (ni + 1);
                    return Array.from({ length: nextCount }).map((_, nj) => {
                        const y2 = (h / (nextCount + 1)) * (nj + 1);
                        return <line key={`${li}-${ni}-${nj}`} x1={lx[li]} y1={y1} x2={lx[li + 1]} y2={y2}
                            stroke="rgba(0,212,255,.12)" strokeWidth="0.7">
                            <animate attributeName="stroke-opacity" values="0.08;0.25;0.08" dur={`${2 + Math.random() * 2}s`} repeatCount="indefinite" />
                        </line>;
                    });
                });
            })}
            {/* nodes */}
            {layers.map((count: number, li: number) =>
                Array.from({ length: count }).map((_, ni) => {
                    const y = (h / (count + 1)) * (ni + 1);
                    const colors = ['#f43f5e', '#f59e0b', '#a78bfa', '#10b981'];
                    return <circle key={`n-${li}-${ni}`} cx={lx[li]} cy={y} r="5"
                        fill={colors[li]} opacity="0.7">
                        <animate attributeName="r" values="4;6;4" dur={`${1.5 + Math.random()}s`} repeatCount="indefinite" />
                    </circle>;
                })
            )}
            {/* labels */}
            <text x={lx[0]} y={h - 4} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,.4)">Input</text>
            <text x={lx[1]} y={h - 4} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,.4)">LSTM</text>
            <text x={lx[2]} y={h - 4} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,.4)">Physics</text>
            <text x={lx[3]} y={h - 4} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,.4)">Output</text>
        </svg>
    );
}

/* ── Circuit diagram SVG ── */
function CircuitSVG() {
    return (
        <svg className="lr-circuit-svg" viewBox="0 0 260 80" width="100%" style={{ maxWidth: 300 }}>
            {/* wires */}
            <line x1="20" y1="40" x2="60" y2="40" stroke="var(--cyan)" strokeWidth="1.5" />
            <line x1="100" y1="40" x2="140" y2="40" stroke="var(--cyan)" strokeWidth="1.5" />
            <line x1="180" y1="40" x2="240" y2="40" stroke="var(--cyan)" strokeWidth="1.5" />
            {/* R_s */}
            <rect x="60" y="32" width="40" height="16" rx="3" fill="none" stroke="#f59e0b" strokeWidth="1.2">
                <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </rect>
            <text x="80" y="44" textAnchor="middle" fontSize="8" fill="#f59e0b">Rₛ</text>
            {/* C */}
            <line x1="155" y1="25" x2="155" y2="55" stroke="#10b981" strokeWidth="2" />
            <line x1="165" y1="25" x2="165" y2="55" stroke="#10b981" strokeWidth="2" />
            <text x="160" y="70" textAnchor="middle" fontSize="8" fill="#10b981">C(v)</text>
            {/* R_p */}
            <rect x="140" y="18" width="40" height="12" rx="3" fill="none" stroke="#a78bfa" strokeWidth="1">
                <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite" />
            </rect>
            <text x="160" y="14" textAnchor="middle" fontSize="7" fill="#a78bfa">Rₚ</text>
            {/* terminals */}
            <circle cx="20" cy="40" r="4" fill="#f43f5e" opacity="0.8">
                <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="240" cy="40" r="4" fill="#f43f5e" opacity="0.8">
                <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" begin="0.7s" />
            </circle>
            <text x="20" y="58" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,.5)">i(k)</text>
            <text x="240" y="58" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,.5)">v(k)</text>
        </svg>
    );
}

/* ── Comparison bars ── */
function ComparisonBars() {
    const items = [
        { label: 'Physics-Only', acc: 82, speed: 95, interp: 98, color: '#f59e0b' },
        { label: 'Data-Driven', acc: 91, speed: 70, interp: 30, color: '#f43f5e' },
        { label: 'Hybrid PI-LSTM', acc: 96, speed: 85, interp: 88, color: '#00d4ff' },
    ];
    return (
        <div className="lr-compare">
            <div className="lr-compare-legend">
                <span>■ Accuracy</span><span>■ Speed</span><span>■ Interpretability</span>
            </div>
            {items.map((it) => (
                <div key={it.label} className="lr-compare-row">
                    <span className="lr-compare-label" style={{ color: it.color }}>{it.label}</span>
                    <div className="lr-compare-bars">
                        <div className="lr-bar"><div className="lr-bar-fill" style={{ width: `${it.acc}%`, background: it.color, animationDelay: '0s' }} /><span>{it.acc}%</span></div>
                        <div className="lr-bar"><div className="lr-bar-fill" style={{ width: `${it.speed}%`, background: it.color, opacity: 0.7, animationDelay: '0.2s' }} /><span>{it.speed}%</span></div>
                        <div className="lr-bar"><div className="lr-bar-fill" style={{ width: `${it.interp}%`, background: it.color, opacity: 0.5, animationDelay: '0.4s' }} /><span>{it.interp}%</span></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── Key stats animated ── */
function HeroStats() {
    const papers = useCounter(150, 2500);
    const models = useCounter(42, 2000);
    const domains = useCounter(8, 1500);
    const refs = useCounter(21, 1800);
    return (
        <div className="lr-hero-stats">
            <div className="lr-stat"><span className="lr-stat-val" style={{ color: '#00d4ff' }}>{papers}+</span><span className="lr-stat-label">Papers Reviewed</span></div>
            <div className="lr-stat"><span className="lr-stat-val" style={{ color: '#10b981' }}>{models}+</span><span className="lr-stat-label">Models Analyzed</span></div>
            <div className="lr-stat"><span className="lr-stat-val" style={{ color: '#f59e0b' }}>{domains}</span><span className="lr-stat-label">Domains Covered</span></div>
            <div className="lr-stat"><span className="lr-stat-val" style={{ color: '#a78bfa' }}>{refs}</span><span className="lr-stat-label">Key References</span></div>
        </div>
    );
}

/* ── expand/collapse ── */
function useExpanded() {
    const init: Record<string, boolean> = {};
    sections.forEach((s) => { init[s.id] = true; s.subsections?.forEach((sub) => { init[sub.id] = true; }); });
    const [open, setOpen] = useState(init);
    const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !p[id] }));
    return { open, toggle };
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
export default function LiteratureReview() {
    const { open, toggle } = useExpanded();

    return (
        <div className="lr-page">
            {/* ── Hero ── */}
            <div className="lr-hero glass-card fade-in">
                <Particles />
                <div className="lr-hero-icon">📚</div>
                <h1 className="lr-hero-title">Digital Twins for Energy Storage Systems</h1>
                <p className="lr-hero-sub">A Comprehensive Review with Emphasis on Offline Physics‑Informed LSTM Modeling</p>
                <div className="lr-hero-tags">
                    {['Literature Review', 'Digital Twin', 'PI-LSTM', 'Energy Storage', 'Supercapacitors'].map((t) => (
                        <span key={t} className="lr-tag">{t}</span>
                    ))}
                </div>
                <HeroStats />
                <div className="lr-hero-visuals">
                    <NeuralNetworkSVG />
                    <CircuitSVG />
                </div>
            </div>

            {/* ── Comparison banner ── */}
            <div className="lr-banner glass-card fade-in fade-in-d1">
                <h3 className="lr-banner-title">⚖️ Modeling Paradigm Comparison</h3>
                <ComparisonBars />
            </div>

            {/* ── Sections ── */}
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
                            {sec.content && <div className="lr-text">{sec.content.split('\n\n').map((p: string, i: number) => <p key={i}>{p}</p>)}</div>}
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
                                            {sub.content && <div className="lr-text">{sub.content.split('\n\n').map((p: string, i: number) => <p key={i}>{p}</p>)}</div>}

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

                                            {'stats' in sub && sub.stats && (
                                                <div className="lr-stats-grid">{sub.stats.map((s: { value: string; label: string; color: string }, i: number) => (
                                                    <div key={i} className="lr-stat-card" style={{ '--stat-color': s.color } as React.CSSProperties}>
                                                        <span className="lr-stat-card-val">{s.value}</span>
                                                        <span className="lr-stat-card-label">{s.label}</span>
                                                    </div>
                                                ))}</div>
                                            )}

                                            {'flow' in sub && sub.flow && (
                                                <div className="lr-flow">{sub.flow.map((f: { icon: string; label: string; color: string }, i: number) => (
                                                    <React.Fragment key={i}>
                                                        <div className="lr-flow-node" style={{ '--flow-color': f.color, animationDelay: `${i * 0.15}s` } as React.CSSProperties}>
                                                            <span className="lr-flow-icon">{f.icon}</span>
                                                            <span className="lr-flow-label">{f.label}</span>
                                                        </div>
                                                        {i < sub.flow.length - 1 && <div className="lr-flow-arrow">
                                                            <svg width="24" height="14" viewBox="0 0 24 14"><path d="M0 7h18m0 0l-5-5m5 5l-5 5" stroke={f.color} fill="none" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                                        </div>}
                                                    </React.Fragment>
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

            {/* ── References ── */}
            <div className="lr-section glass-card fade-in fade-in-d4">
                <div className="lr-sec-body" style={{ padding: '22px 28px' }}>
                    <h3 style={{ fontSize: '0.85rem', marginBottom: 12, color: 'var(--text-primary)' }}>📎 References</h3>
                    <ol className="lr-refs">
                        {[
                            '[1] Grieves & Vickers, "Digital Twin: Mitigating Emergent Behavior," Springer, 2017.',
                            '[2] Tao et al., "Digital twin in industry: State-of-the-art," IEEE TII, 2019.',
                            '[3] Jones et al., "Characterising the Digital Twin," CIRP Journal, 2020.',
                            '[4] Rasheed et al., "Digital Twin: Values, Challenges, Enablers," IEEE Access, 2020.',
                            '[5] Wagg et al., "Digital Twins: State of the Art," ASCE-ASME J., 2020.',
                            '[6] Jossen, "Fundamentals of battery dynamics," J. Power Sources, 2006.',
                            '[7] Lipu et al., "SOH and RUL estimation," J. Cleaner Prod., 2018.',
                            '[8] Vaswani et al., "Attention Is All You Need," NeurIPS, 2017.',
                            '[9] Tao et al., "DT-driven product design," J. Manufacturing Systems, 2018.',
                            '[10] Corral-Acero et al., "Digital twin of the human heart," European Heart J., 2020.',
                            '[11–13] Various — healthcare, city, emerging domain DT studies.',
                            '[14–16] VanDerHorn, Kapteyn, Eckhart — uncertainty, V&V, security.',
                            '[17–20] Ethics, networking, edge, sustainability references.',
                            '[21] Present work — PI-LSTM for supercapacitor voltage modeling.',
                        ].map((r, i) => <li key={i}>{r}</li>)}
                    </ol>
                </div>
            </div>
        </div>
    );
}
