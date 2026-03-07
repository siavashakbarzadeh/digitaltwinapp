import React from 'react';

interface AnimatedSuperCapProps {
    charging?: boolean;
    voltage?: number;
    color?: string;
    size?: number;
}

export default function AnimatedSuperCap({ charging = false, voltage = 0.5, color = '#00d4ff', size = 150 }: AnimatedSuperCapProps) {
    const chargePct = Math.min(100, (voltage / 2.7) * 100);

    return (
        <div className="sc-container" style={{ width: size, height: size * 1.5 }}>
            <div className="sc-cyl">
                <div className="sc-top"></div>
                <div className="sc-side">
                    <div className="sc-fill" style={{
                        height: `${chargePct}%`,
                        background: charging ? `linear-gradient(to top, ${color}, #fff)` : color,
                        boxShadow: charging ? `0 0 20px ${color}` : 'none'
                    }}></div>
                    <div className="sc-labels">
                        <span>{chargePct.toFixed(1)}%</span>
                        <small>{voltage.toFixed(2)}V</small>
                    </div>
                </div>
                <div className="sc-bottom"></div>
            </div>
            {charging && <div className="sc-glow" style={{ background: color }}></div>}

            <style>{`
                .sc-container { position: relative; perspective: 600px; display: flex; align-items: center; justify-content: center; transform-style: preserve-3d; }
                .sc-cyl { position: relative; width: 60px; height: 120px; transform: rotateX(-5deg) rotateY(15deg); transform-style: preserve-3d; transition: all 0.5s; }
                .sc-top { position: absolute; top: -15px; width: 60px; height: 30px; background: #2a2d3e; border-radius: 50%; border: 3px solid #1e2130; z-index: 2; }
                .sc-bottom { position: absolute; bottom: -15px; width: 60px; height: 30px; background: #1e2130; border-radius: 50%; z-index: 0; }
                .sc-side { position: absolute; width: 60px; height: 120px; background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden; display: flex; flex-direction: column-reverse; }
                .sc-fill { width: 100%; transition: height 0.3s ease; opacity: 0.6; }
                .sc-labels { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; text-shadow: 0 0 10px rgba(0,0,0,0.8); }
                .sc-labels span { font-weight: 800; font-size: 0.9rem; color: #fff; }
                .sc-labels small { font-size: 0.6rem; color: rgba(255,255,255,0.7); }
                .sc-glow { position: absolute; width: 100px; height: 100px; border-radius: 50%; filter: blur(40px); opacity: 0.3; z-index: -1; animation: sc-pulse 2s infinite ease-in-out; }
                @keyframes sc-pulse { 0%, 100% { transform: scale(1); opacity: 0.2; } 50% { transform: scale(1.3); opacity: 0.4; } }
            `}</style>
        </div>
    );
}
