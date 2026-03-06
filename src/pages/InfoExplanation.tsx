/* ═══════════════════════════════════════════════════
   Info / Explanation Screen
   ═══════════════════════════════════════════════════ */

export default function InfoExplanation() {
    return (
        <div className="info-page fade-in">
            <div className="info-hero glass-card">
                <h1>📖 Energy Digital Twins</h1>
                <p>Understanding the bridge between real-world energy storage and virtual modeling.</p>
            </div>

            <section className="info-grid">
                <div className="info-card glass-card">
                    <h3>💡 What is a Digital Twin?</h3>
                    <p>
                        A Digital Twin (DT) is a virtual representation of a physical object or system.
                        In energy research, it uses real-time or offline data and mathematical models
                        to mirror the behavior of assets like supercapacitors or batteries.
                    </p>
                    <div className="tech-badge">Cyber-Physical Systems</div>
                </div>

                <div className="info-card glass-card">
                    <h3>🔍 PI-LSTM Methodology</h3>
                    <p>
                        This research focuses on **Physics-Informed LSTMs (PI-LSTM)**. By embedding
                        RC equivalent circuit equations into the neural network's loss function,
                        the model remains accurate and physically consistent even with noisy data.
                    </p>
                    <div className="tech-badge">Hybrid AI Modeling</div>
                </div>

                <div className="info-card glass-card">
                    <h3>⚠️ Current Limitations</h3>
                    <ul className="limitation-list">
                        <li><strong>Offline Data:</strong> Uses precomputed datasets and simulations rather than live hardware streams.</li>
                        <li><strong>Simplified Models:</strong> Current scenarios use 1-RC or 2-RC models; complex electrochemical effects are abstracted.</li>
                        <li><strong>No Direct Control:</strong> The dashboard is read-only; bidirectional control (OBC) is not yet implemented.</li>
                    </ul>
                </div>

                <div className="info-card glass-card">
                    <h3>🚀 Planned Extensions</h3>
                    <ul className="extension-list">
                        <li><strong>Real-time HIL:</strong> Hardware-in-the-loop connection to lab supercapacitor testers for live monitoring.</li>
                        <li><strong>Online Aging:</strong> Dynamic SOH estimation using Recursive Least Squares (RLS) on live hardware.</li>
                        <li><strong>Multi-Cell View:</strong> Monitoring of entire packs with individual cell balancing visualization.</li>
                    </ul>
                </div>
            </section>

            <div className="roadmap-section glass-card">
                <h3>🛠️ Research Roadmap</h3>
                <div className="roadmap-timeline">
                    <div className="timeline-item">
                        <div className="time-marker">Phase 1</div>
                        <div className="time-content">
                            <h4>Offline Parameter Identification</h4>
                            <p>Identifying base RC parameters using Differential Evolution and standard LSTM benchmarks.</p>
                        </div>
                    </div>
                    <div className="timeline-item current">
                        <div className="time-marker">Phase 2</div>
                        <div className="time-content">
                            <h4>Physics-Informed Architecture</h4>
                            <p>Developing the PI-LSTM framework to ensure physical consistency in voltage reconstruction.</p>
                        </div>
                    </div>
                    <div className="timeline-item">
                        <div className="time-marker">Phase 3</div>
                        <div className="time-content">
                            <h4>Real-time Digital Twin Deployment</h4>
                            <p>Scaling the model to edge devices for live predictive maintenance and SOC/SOH estimation.</p>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="info-footer">
                <p>© 2024 · PhD Research Demo · Digital Twin Framework for Supercapacitor Assets</p>
            </footer>
        </div>
    );
}
