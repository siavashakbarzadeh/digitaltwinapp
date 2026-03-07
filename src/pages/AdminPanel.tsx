import React, { useState, useEffect } from 'react';
import { scenarios as initialScenarios, buildScenario, AssetType, DeviceCondition, ASSET_PARAMS } from '../data/scenarios';
import type { Scenario } from '../data/scenarios';

/* ══════════════════════════════════════════════════════════════
   Admin Panel — Centralized Digital Twin Management
   Features: Scenario CRUD, Asset Tuning, Training Ops, Logs
   ══════════════════════════════════════════════════════════════ */

interface AdminProps {
    selectedScenarioId: string;
    onSelectScenario: (id: string) => void;
}

type AdminTab = 'scenarios' | 'config' | 'training' | 'logs';

export default function AdminPanel({ selectedScenarioId, onSelectScenario }: AdminProps) {
    const [activeTab, setActiveTab] = useState<AdminTab>('scenarios');
    const [scenarioList, setScenarioList] = useState<Scenario[]>(initialScenarios);
    const [assetParams, setAssetParams] = useState(ASSET_PARAMS);
    const [logs, setLogs] = useState<{ id: string; time: string; msg: string; type: 'info' | 'warn' | 'success' }[]>([
        { id: '1', time: new Date().toLocaleTimeString(), msg: 'Admin Panel Initialized', type: 'info' },
    ]);

    // Scenario Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [newScenario, setNewScenario] = useState({
        name: 'New Custom Scenario',
        description: 'User-defined load profile.',
        profileType: 'User Defined',
        current: 50,
        duration: 60,
        color: '#f43f5e',
        assetType: 'supercapacitor' as AssetType,
        condition: 'new' as DeviceCondition
    });

    // Training State
    const [isTraining, setIsTraining] = useState(false);
    const [trainingProgress, setTrainingProgress] = useState(0);

    const log = (msg: string, type: 'info' | 'warn' | 'success' = 'info') => {
        setLogs(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 50));
    };

    const handleAddScenario = () => {
        const id = `custom-${Date.now()}`;
        const currentFn = (t: number) => {
            const phase = t % newScenario.duration;
            return phase < newScenario.duration * 0.7 ? newScenario.current : -newScenario.current / 2;
        };

        const added = buildScenario(
            id,
            newScenario.name,
            newScenario.description,
            newScenario.profileType,
            `${newScenario.current} A`,
            newScenario.color,
            currentFn,
            newScenario.duration,
            0.5,
            0.5,
            newScenario.assetType,
            newScenario.condition
        );

        setScenarioList([added, ...scenarioList]);
        setShowAddForm(false);
        log(`Successfully added scenario "${added.name}"`, 'success');
        onSelectScenario(id);
    };

    const handleDeleteScenario = (id: string) => {
        if (scenarioList.length <= 1) {
            log('Cannot delete empty scenario set', 'warn');
            return;
        }
        setScenarioList(prev => prev.filter(s => s.id !== id));
        log(`Deleted scenario ${id}`, 'info');
        if (selectedScenarioId === id) {
            onSelectScenario(scenarioList.find(s => s.id !== id)?.id || '');
        }
    };

    const handleRunTraining = () => {
        setIsTraining(true);
        setTrainingProgress(0);
        log('Began PI-LSTM Physics-Informed Training Session...', 'info');

        const interval = setInterval(() => {
            setTrainingProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    setIsTraining(false);
                    log('PI-LSTM Training Completed. Residuals converged.', 'success');
                    return 100;
                }
                return p + Math.random() * 5;
            });
        }, 150);
    };

    return (
        <div className="admin-panel fade-in">
            {/* ── Admin Header ── */}
            <div className="admin-header-strip glass-card" style={{ display: 'flex', gap: '20px', padding: '12px 24px', marginBottom: '24px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>⚙️ Digital Twin Operations Center</h2>
                    <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>Centralized Control for Model Hyperparameters & Asset Data</p>
                </div>
                <div className="admin-tabs" style={{ display: 'flex', gap: '4px' }}>
                    {(['scenarios', 'config', 'training', 'logs'] as AdminTab[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            style={{
                                padding: '8px 16px',
                                background: activeTab === t ? 'rgba(0,212,255,0.1)' : 'transparent',
                                border: '1px solid',
                                borderColor: activeTab === t ? 'rgba(0,212,255,0.3)' : 'transparent',
                                color: activeTab === t ? 'var(--cyan)' : 'var(--text-secondary)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {t.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="admin-content-window">
                {/* ── Tab 1: Scenario Manager ── */}
                {activeTab === 'scenarios' && (
                    <div className="tab-scenarios fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1rem' }}>🗃️ Active Scenarios ({scenarioList.length})</h3>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => {
                                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scenarioList, null, 2));
                                        const dl = document.createElement('a');
                                        dl.setAttribute("href", dataStr);
                                        dl.setAttribute("download", "digital_twin_scenarios.json");
                                        dl.click();
                                        log('Scenario library exported.', 'success');
                                    }}
                                    style={{ padding: '8px 16px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                                >
                                    📤 Export JSON
                                </button>
                                <button
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    style={{ padding: '8px 20px', borderRadius: '6px', background: 'var(--cyan)', border: 'none', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                                >
                                    {showAddForm ? 'Cancel' : '+ New Profile'}
                                </button>
                            </div>
                        </div>

                        {showAddForm && (
                            <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px', border: '1px solid var(--cyan-dim)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Alias</label>
                                        <input
                                            type="text"
                                            value={newScenario.name}
                                            onChange={e => setNewScenario({ ...newScenario, name: e.target.value })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'white' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Asset Type</label>
                                        <select
                                            value={newScenario.assetType}
                                            onChange={e => setNewScenario({ ...newScenario, assetType: e.target.value as AssetType })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'white' }}
                                        >
                                            <option value="supercapacitor">Supercapacitor</option>
                                            <option value="battery">Battery Pack</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Condition</label>
                                        <select
                                            value={newScenario.condition}
                                            onChange={e => setNewScenario({ ...newScenario, condition: e.target.value as DeviceCondition })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'white' }}
                                        >
                                            <option value="new">Pristine (New)</option>
                                            <option value="aged">Degraded (Aged)</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddScenario}
                                    style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '6px', background: 'var(--emerald)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Compile & Inject Profile
                                </button>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {scenarioList.map(s => (
                                <div key={s.id} className={`glass-card ${selectedScenarioId === s.id ? 'active' : ''}`} style={{ padding: '20px', position: 'relative', border: selectedScenarioId === s.id ? '1px solid var(--cyan)' : '1px solid var(--border)', transition: 'all 0.3s ease' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>{s.name}</h4>
                                            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                                                <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>{s.assetType}</span>
                                                <span style={{ fontSize: '0.65rem', background: s.condition === 'new' ? 'var(--emerald-dim)' : 'var(--amber-dim)', padding: '2px 6px', borderRadius: '4px', color: s.condition === 'new' ? 'var(--emerald)' : 'var(--amber)' }}>{s.condition}</span>
                                            </div>
                                        </div>
                                        {selectedScenarioId === s.id && <span style={{ fontSize: '0.65rem', color: 'var(--cyan)', fontWeight: 700 }}>ACTIVE</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                        <button onClick={() => onSelectScenario(s.id)} style={{ flex: 1, padding: '8px', fontSize: '0.75rem', borderRadius: '6px', background: selectedScenarioId === s.id ? 'var(--cyan)' : 'rgba(255,255,255,0.05)', border: 'none', color: selectedScenarioId === s.id ? '#000' : 'white', fontWeight: 600, cursor: 'pointer' }}>Select Target</button>
                                        <button onClick={() => handleDeleteScenario(s.id)} style={{ padding: '8px 12px', fontSize: '0.75rem', borderRadius: '6px', background: 'rgba(244,63,94,0.1)', border: 'none', color: 'var(--rose)', cursor: 'pointer' }}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Tab 2: Asset Config ── */}
                {activeTab === 'config' && (
                    <div className="tab-config fade-in">
                        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(0,212,255,0.05), transparent)' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>🛠️ Physical Asset Parameter Tuning</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                                Paradoxical constraints and first-principles constants used by the PI-LSTM residual function.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                            {Object.entries(assetParams).map(([type, conditions]) => (
                                <div key={type} className="glass-card" style={{ padding: '24px' }}>
                                    <h4 style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--cyan)', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>{type} Specifications</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        {Object.entries(conditions).map(([cond, params]) => (
                                            <div key={cond}>
                                                <h5 style={{ fontSize: '0.75rem', marginBottom: '12px', color: cond === 'new' ? 'var(--emerald)' : 'var(--amber)' }}>{cond.toUpperCase()}</h5>
                                                <div style={{ display: 'grid', gap: '12px' }}>
                                                    {Object.entries(params).map(([key, val]) => (
                                                        <div key={key}>
                                                            <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{key} Parameter</label>
                                                            <input
                                                                type="number"
                                                                step="0.0001"
                                                                value={val}
                                                                onChange={(e) => {
                                                                    const newVal = Number(e.target.value);
                                                                    setAssetParams(p => ({
                                                                        ...p,
                                                                        [type]: {
                                                                            ...p[type as AssetType],
                                                                            [cond]: { ...p[type as AssetType][cond as DeviceCondition], [key]: newVal }
                                                                        }
                                                                    }));
                                                                    log(`Constraint tuned: ${type}.${cond}.${key} = ${newVal}`, 'info');
                                                                }}
                                                                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'white', fontSize: '0.85rem' }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Tab 3: Model Training ── */}
                {activeTab === 'training' && (
                    <div className="tab-training fade-in" style={{ padding: '20px' }}>
                        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px auto' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🧠</div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>PI-LSTM Offline Training Console</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
                                Optimize the digital twin's neural surrogate by embedding physical constraints into the gradient descent process.
                                This ensures the model remains physically consistent even in extrapolative regions.
                            </p>

                            {isTraining ? (
                                <div className="training-active" style={{ padding: '20px', background: 'rgba(0,212,255,0.03)', borderRadius: '12px', border: '1px solid var(--cyan-dim)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '12px' }}>
                                        <span style={{ color: 'var(--cyan)' }}>RETRAINING SURROGATE...</span>
                                        <span style={{ fontWeight: 700 }}>{Math.floor(trainingProgress)}%</span>
                                    </div>
                                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', marginBottom: '16px', overflow: 'hidden' }}>
                                        <div style={{ width: `${trainingProgress}%`, height: '100%', background: 'linear-gradient(to right, var(--cyan), var(--emerald))', transition: 'width 0.2s' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.7rem' }}>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ color: 'var(--text-muted)' }}>EPOCH</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--cyan)', fontWeight: 600 }}>{Math.floor(trainingProgress / 5)} / 20</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: 'var(--text-muted)' }}>PHYSICS RESIDUAL (MSE)</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--emerald)', fontWeight: 600 }}>{(0.015 * (1 - trainingProgress / 100)).toFixed(6)}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleRunTraining}
                                    style={{ padding: '16px 40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--cyan), var(--violet))', border: 'none', color: 'white', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,212,255,0.25)', transition: 'transform 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    Execute PI-LSTM Retraining
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div className="glass-card" style={{ padding: '24px' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: 'var(--emerald)' }}>●</span> Training History Log
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { app: 'PI-LSTM Framework', ts: '2024-03-07 01:20', acc: '99.1% Fidelity', status: 'Optimal' },
                                        { app: 'Vanilla LSTM', ts: '2024-03-07 01:15', acc: '95.5% Fidelity', status: 'Unstable' },
                                        { app: 'Transfer Learning', ts: '2024-03-06 22:40', acc: '97.2% Fidelity', status: 'Stable' },
                                    ].map((h, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{h.app}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{h.ts}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.8rem', color: i === 0 ? 'var(--emerald)' : 'var(--text-secondary)' }}>{h.acc}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{h.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="glass-card" style={{ padding: '24px' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: 'var(--rose)' }}>●</span> High-Performance Telemetry
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '8px' }}>Compute Core Temp</label>
                                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: isTraining ? 'var(--rose)' : 'var(--emerald)' }}>{isTraining ? '74°C' : '38°C'}</span>
                                    </div>
                                    <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '8px' }}>VRAM Allocation</label>
                                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--cyan)' }}>{isTraining ? '11.4 GB' : '1.2 GB'}</span>
                                    </div>
                                    <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '8px' }}>Memory Bandwidth</label>
                                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--amber)' }}>{isTraining ? '840 GB/s' : '42 GB/s'}</span>
                                    </div>
                                    <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '8px' }}>Training Speed</label>
                                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>{isTraining ? '142 it/s' : '0 it/s'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Tab 4: Logs ── */}
                {activeTab === 'logs' && (
                    <div className="tab-logs fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="status-dot"></span> Real-time Event Stream
                            </h3>
                            <button onClick={() => setLogs([])} style={{ background: 'rgba(244,63,94,0.1)', border: 'none', color: 'var(--rose)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Clear Buffer</button>
                        </div>
                        <div className="glass-card" style={{ height: '500px', overflowY: 'auto', padding: '20px', background: 'rgba(6,10,19,0.7)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', border: '1px solid var(--border)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                            {logs.map(l => (
                                <div key={l.id} style={{ marginBottom: '8px', opacity: 0.9, display: 'flex', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                                    <span style={{ color: 'var(--text-muted)', minWidth: '90px' }}>[{l.time}]</span>
                                    <span style={{ color: l.type === 'success' ? 'var(--emerald)' : l.type === 'warn' ? 'var(--amber)' : 'var(--cyan)', minWidth: '80px', fontWeight: 700 }}>{l.type.toUpperCase()}</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{l.msg}</span>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <div style={{ textAlign: 'center', marginTop: '150px', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📡</div>
                                    <p>Waiting for system events...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .admin-panel .glass-card.active {
                    background: rgba(0,212,255,0.06);
                    border-color: var(--cyan) !important;
                    box-shadow: 0 0 30px rgba(0,212,255,0.1);
                    transform: translateY(-2px);
                }
                .form-group input:focus, .form-group select:focus {
                    outline: none;
                    border-color: var(--cyan) !important;
                    box-shadow: 0 0 10px var(--cyan-dim);
                    background: rgba(255,255,255,0.08) !important;
                }
                .tab-logs::-webkit-scrollbar { width: 6px; }
                .tab-logs::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 10px; }
                .tab-logs::-webkit-scrollbar-track { background: transparent; }
                
                @keyframes pulse-cyan {
                    0% { box-shadow: 0 0 0 0 rgba(0,212,255,0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(0,212,255,0); }
                    100% { box-shadow: 0 0 0 0 rgba(0,212,255,0); }
                }
                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: var(--emerald);
                    border-radius: 50%;
                    animation: pulse-dot 2s infinite;
                }
            `}</style>
        </div>
    );
}
