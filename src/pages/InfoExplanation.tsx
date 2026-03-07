/* ═══════════════════════════════════════════════════
   Info / Explanation Screen - Enhanced UI
   ═══════════════════════════════════════════════════ */
import React from 'react';

export default function InfoExplanation() {
    return (
        <div className="info-page fade-in" style={{ paddingBottom: '60px' }}>
            {/* ── Hero Banner ── */}
            <div className="info-hero glass-card fade-in" style={{ textAlign: 'center', padding: '60px 20px', marginBottom: '36px', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(0,212,255,0.04))', borderTop: '4px solid var(--cyan)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'float 4s ease-in-out infinite' }}>🌍</div>
                <h1 style={{ fontSize: '3rem', marginBottom: '16px', fontWeight: 800, background: 'linear-gradient(to right, #00d4ff, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Energy Digital Twins
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.7 }}>
                    Bridging the physical and virtual worlds. A cutting-edge cyber-physical framework designed for intelligent energy storage modelling and health monitoring.
                </p>
            </div>

            {/* ── High-Fidelity Isometric Digital Twin Visual ── */}
            <div className="glass-card fade-in fade-in-d1" style={{ marginBottom: '40px', padding: 0, textAlign: 'left', background: '#0a1118', border: '1px solid #1c2b36', overflow: 'hidden', position: 'relative', height: '540px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                {/* Background Image */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/sc_isometric_twin.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.85, mixBlendMode: 'luminosity', filter: 'brightness(0.9) contrast(1.2)' }}></div>

                {/* Cyan/Emerald Overlay Glow */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0,212,255,0.05) 0%, rgba(10,17,24,0.95) 90%)' }}></div>

                {/* Animated SVG Connection Lines */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                    <defs>
                        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {/* Isometric-style data paths */}
                    <path d="M 250 200 L 400 280 L 550 200 L 700 280" fill="none" stroke="url(#lineGrad)" strokeWidth="2" filter="url(#glow)" strokeDasharray="10 10" className="anim-dash" />
                    <path d="M 700 280 L 550 360 L 400 280 L 250 360" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" filter="url(#glow)" strokeDasharray="5 15" className="anim-dash-reverse" />

                    {/* Animated Data Dots passing along paths */}
                    <circle r="4" fill="#fff" filter="url(#glow)">
                        <animateMotion dur="4s" repeatCount="indefinite" path="M 250 200 L 400 280 L 550 200 L 700 280" />
                    </circle>
                    <circle r="4" fill="#10b981" filter="url(#glow)">
                        <animateMotion dur="6s" repeatCount="indefinite" path="M 700 280 L 550 360 L 400 280 L 250 360" />
                    </circle>
                </svg>

                {/* Main Title inside HUD */}
                <div style={{ position: 'absolute', top: '24px', left: '32px', zIndex: 2 }}>
                    <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', background: '#00d4ff', borderRadius: '50%', boxShadow: '0 0 10px #00d4ff', animation: 'pulse 1.5s infinite' }}></span>
                        Supercapacitor Digital Twin
                    </h3>
                </div>

                {/* Floating HUD Panel 1: Operations */}
                <div className="hud-panel" style={{ position: 'absolute', top: '100px', left: '32px', background: 'rgba(10,17,24,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,212,255,0.2)', padding: '16px', borderRadius: '12px', zIndex: 2, width: '220px', animation: 'float 5s ease-in-out infinite' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#00d4ff', fontSize: '0.8rem', fontWeight: 600 }}>Cell Simulation</span>
                        <span style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px' }}>Pre Mode</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                            <span style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Voltage (V)</span>
                            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>2.72</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Current (A)</span>
                            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>90.0</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Temp (°C)</span>
                            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>32.1</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>SOC (%)</span>
                            <span style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: 'bold' }}>98.2</span>
                        </div>
                    </div>
                </div>

                {/* Floating HUD Panel 2: SOH Tracking */}
                <div className="hud-panel" style={{ position: 'absolute', top: '120px', right: '40px', background: 'rgba(10,17,24,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(16,185,129,0.2)', padding: '16px', borderRadius: '12px', zIndex: 2, width: '240px', animation: 'float 6s ease-in-out infinite reverse' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>Energy Balance / SOH</span>
                        <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>98.4%</span>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                            <span>Pre Mode Distribution</span>
                            <span>Capacitance (F): 3080</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                            <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #00d4ff, #10b981)', borderRadius: '2px', boxShadow: '0 0 8px #10b981' }}></div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                        <div>
                            <span style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>ESR (mΩ)</span>
                            <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>0.28</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>Power (kW)</span>
                            <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>0.24</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>Efficiency</span>
                            <span style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 'bold' }}>94%</span>
                        </div>
                    </div>
                </div>

                {/* Inline Isometric Target Labels */}
                <div style={{ position: 'absolute', top: '350px', left: '42%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', zIndex: 2 }}>
                    ⚡ PI-LSTM Node
                </div>
                <div style={{ position: 'absolute', top: '220px', left: '58%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', zIndex: 2 }}>
                    <span className="battery-large-charging" style={{ fontSize: '1rem !important' }}>🔋</span> Cell Pack 2# (RLS)
                </div>

                {/* Mini Charts HUD at bottom */}
                <div style={{ position: 'absolute', bottom: '24px', left: '32px', right: '32px', display: 'flex', gap: '16px', zIndex: 2 }}>
                    <div style={{ flex: 1, height: '80px', background: 'rgba(10,17,24,0.8)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem' }}>Voltage Prediction (mV)</span>
                        <svg width="100%" height="50" style={{ marginTop: '8px' }}>
                            <path d="M 0 30 Q 15 10 30 25 T 60 20 T 90 35 T 120 15 T 150 25 L 150 50 L 0 50 Z" fill="rgba(0,212,255,0.1)" />
                            <path d="M 0 30 Q 15 10 30 25 T 60 20 T 90 35 T 120 15 T 150 25" fill="none" stroke="#00d4ff" strokeWidth="2" />
                        </svg>
                    </div>
                    <div style={{ flex: 1, height: '80px', background: 'rgba(10,17,24,0.8)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem' }}>Model Loss (ℒ)</span>
                        <svg width="100%" height="50" style={{ marginTop: '8px' }}>
                            <path d="M 0 20 Q 20 25 40 20 T 80 20 T 120 22 T 160 20 L 160 50 L 0 50 Z" fill="rgba(16,185,129,0.1)" />
                            <path d="M 0 20 Q 20 25 40 20 T 80 20 T 120 22 T 160 20" fill="none" stroke="#10b981" strokeWidth="2" />
                        </svg>
                    </div>
                    <div style={{ flex: 1, height: '80px', background: 'rgba(10,17,24,0.8)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem' }}>Temperature (°C)</span>
                        <svg width="100%" height="50" style={{ marginTop: '8px' }}>
                            <path d="M 0 40 Q 20 38 40 40 T 80 35 T 120 38 T 160 39 L 160 50 L 0 50 Z" fill="rgba(167,139,250,0.1)" />
                            <path d="M 0 40 Q 20 38 40 40 T 80 35 T 120 38 T 160 39" fill="none" stroke="#a78bfa" strokeWidth="2" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* ── Core Concepts Grid ── */}
            <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="info-card glass-card fade-in fade-in-d1" style={{ borderTop: '3px solid var(--emerald)', padding: '32px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.3))' }}>💡</div>
                    <h3 style={{ marginBottom: '14px', fontSize: '1.4rem', color: '#fff' }}>Digital Twin Core</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                        A highly accurate virtual counterpart of physical assets. It merges offline historical data with live sensor streams, allowing for dynamic predictions and diagnostics without disrupting operations.
                    </p>
                    <span className="tech-badge" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--emerald)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Cyber-Physical</span>
                </div>

                <div className="info-card glass-card fade-in fade-in-d2" style={{ borderTop: '3px solid var(--violet)', padding: '32px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(167,139,250,0.3))' }}>🧠</div>
                    <h3 style={{ marginBottom: '14px', fontSize: '1.4rem', color: '#fff' }}>PI-LSTM Algorithm</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                        Physics-Informed LSTMs embed fundamental RC-circuit equations directly into the AI loss function. This hybrid approach guarantees physical consistency even when training on noisy or limited data.
                    </p>
                    <span className="tech-badge" style={{ background: 'rgba(167,139,250,0.1)', color: 'var(--violet)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Hybrid AI</span>
                </div>

                <div className="info-card glass-card fade-in fade-in-d3" style={{ borderTop: '3px solid var(--rose)', padding: '32px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(244,63,94,0.3))' }}>⚡</div>
                    <h3 style={{ marginBottom: '14px', fontSize: '1.4rem', color: '#fff' }}>Real-time Tracking</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                        Powered by Recursive Least Squares (RLS), the framework actively adapts to asset degradation, continuously tracking capacitance fade and ESR growth to estimate State of Health (SOH) on the fly.
                    </p>
                    <span className="tech-badge" style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--rose)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Adaptive RLS</span>
                </div>
            </div>

            {/* ── Architecture Flow ── */}
            <div className="glass-card fade-in fade-in-d3" style={{ padding: '40px', marginTop: '40px', textAlign: 'center', background: 'rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '32px', fontSize: '1.6rem', fontWeight: 600 }}>Architectural Workflow</h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', flex: '1 1 200px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s ease' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}><span className="battery-large-charging" style={{ fontSize: '3rem !important' }}>🔋</span></div>
                        <h4 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Physical Asset</h4>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Supercapacitor / Li-Ion</span>
                    </div>
                    <div style={{ color: 'var(--cyan)', fontSize: '1.5rem', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>〰️📡〰️</div>
                    <div style={{ background: 'rgba(0,212,255,0.05)', padding: '24px', borderRadius: '16px', flex: '1 1 200px', border: '1px solid rgba(0,212,255,0.2)', transition: 'transform 0.3s ease', boxShadow: '0 8px 32px rgba(0,212,255,0.1)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⚙️</div>
                        <h4 style={{ marginBottom: '8px', fontSize: '1.1rem', color: '#fff' }}>Edge Compute</h4>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>RLS Filter + PI-LSTM</span>
                    </div>
                    <div style={{ color: 'var(--emerald)', fontSize: '1.5rem', fontWeight: 'bold', animation: 'pulse 2s infinite alternate' }}>〰️🌐〰️</div>
                    <div style={{ background: 'rgba(16,185,129,0.05)', padding: '24px', borderRadius: '16px', flex: '1 1 200px', border: '1px solid rgba(16,185,129,0.2)', transition: 'transform 0.3s ease', boxShadow: '0 8px 32px rgba(16,185,129,0.1)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>💻</div>
                        <h4 style={{ marginBottom: '8px', fontSize: '1.1rem', color: '#fff' }}>Mission Control</h4>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Interactive Twin UI</span>
                    </div>
                </div>
            </div>

            {/* ── Roadmap ── */}
            <div className="glass-card fade-in fade-in-d4" style={{ marginTop: '40px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
                <h3 style={{ marginBottom: '32px', fontSize: '1.6rem', fontWeight: 600 }}>🛠️ PhD Research Roadmap</h3>

                <div style={{ position: 'relative', paddingLeft: '32px', borderLeft: '3px solid rgba(255,255,255,0.08)' }}>

                    <div style={{ marginBottom: '40px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-42px', top: '4px', width: '21px', height: '21px', borderRadius: '50%', background: 'var(--emerald)', border: '4px solid var(--card-bg)' }}></div>
                        <h4 style={{ color: 'var(--emerald)', marginBottom: '12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Phase 1: Foundation <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.2)', padding: '4px 8px', borderRadius: '12px', color: '#fff' }}>Completed</span>
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '700px' }}>
                            Characterised standalone cells. Extracted baseline offline RC parameters through Differential Evolution. Validated basic data-driven LSTM models against physical testing profiles.
                        </p>
                    </div>

                    <div style={{ marginBottom: '40px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-42px', top: '4px', width: '21px', height: '21px', borderRadius: '50%', background: 'var(--cyan)', border: '4px solid var(--card-bg)', boxShadow: '0 0 15px var(--cyan)' }}></div>
                        <h4 style={{ color: 'var(--cyan)', marginBottom: '12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Phase 2: Hybrid Integration <span style={{ fontSize: '0.75rem', background: 'rgba(0,212,255,0.2)', padding: '4px 8px', borderRadius: '12px', animation: 'pulse 1.5s infinite', color: '#fff' }}>Current Focus</span>
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '700px' }}>
                            Developing and refining the Physics-Informed LSTM (PI-LSTM) framework. Implementing the real-time Recursive Least Squares (RLS) estimator for continuous, adaptive State of Health (SOH) tracking.
                        </p>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-42px', top: '4px', width: '21px', height: '21px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '4px solid var(--card-bg)' }}></div>
                        <h4 style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Phase 3: Hardware-in-the-Loop <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '12px', color: 'rgba(255,255,255,0.7)' }}>Upcoming</span>
                        </h4>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '700px' }}>
                            Deploying trained models to edge microcontrollers. Establishing bi-directional communication with laboratory cyclers for fully closed-loop, predictive energy management.
                        </p>
                    </div>

                </div>
            </div>

            {/* ── Footer ── */}
            <footer className="fade-in fade-in-d4" style={{ marginTop: '60px', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
                <p style={{ marginBottom: '8px' }}>Designed for academic demonstration. <span className="battery-large-charging" style={{ fontSize: '1rem !important' }}>🔋</span> Supercapacitor & Battery Digital Twins</p>
                <p>© 2024–2026 PhD Research Framework</p>
            </footer>

            {/* Add global keyframes for floating emojis if not present in index.css */}
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; filter: drop-shadow(0 0 10px currentColor); }
                    100% { opacity: 0.5; }
                }
                @keyframes packetMoveForward {
                    0% { left: -20px; }
                    100% { left: 100%; }
                }
                @keyframes packetMoveBackward {
                    0% { left: 100%; }
                    100% { left: -20px; }
                }
                .data-packet.forward {
                    animation: packetMoveForward 1.5s linear infinite;
                }
                .data-packet.backward {
                    animation: packetMoveBackward 2s linear infinite;
                }
            `}</style>
        </div>
    );
}
