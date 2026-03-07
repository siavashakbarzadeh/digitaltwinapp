import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { buildScenario, AssetType, DeviceCondition } from '../data/scenarios';

/* ══════════════════════════════════════════════════════════════
   Admin Panel — Centralized Digital Twin Management
   Connected to Persistent SimulationContext
   ══════════════════════════════════════════════════════════════ */

interface AdminProps {
    selectedScenarioId: string;
    onSelectScenario: (id: string) => void;
}

type AdminTab = 'scenarios' | 'config' | 'training' | 'logs';

export default function AdminPanel({ selectedScenarioId, onSelectScenario }: AdminProps) {
    const {
        scenarios, assetParams, addScenario, deleteScenario, updateAssetParams, logs, addLog, clearLogs
    } = useSimulation();

    const [activeTab, setActiveTab] = useState<AdminTab>('scenarios');

    // Scenario Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [newScenario, setNewScenario] = useState({
        name: 'سناریوی سفارشی جدید',
        description: 'پروفایل بار تعریف شده توسط کاربر',
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

        addScenario(added);
        setShowAddForm(false);
        onSelectScenario(id);
    };

    const handleRunTraining = () => {
        setIsTraining(true);
        setTrainingProgress(0);
        addLog('PI-LSTM Physics-Informed Training Session initiated...');

        const interval = setInterval(() => {
            setTrainingProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    setIsTraining(false);
                    addLog('✅ PI-LSTM Training Completed. Weights optimized.');
                    return 100;
                }
                return p + Math.random() * 8;
            });
        }, 150);
    };

    return (
        <div className="admin-panel fade-in" style={{ direction: 'rtl' }}>
            {/* ── Admin Header ── */}
            <div className="admin-header-strip glass-card" style={{ display: 'flex', gap: '24px', padding: '16px 28px', marginBottom: '24px', alignItems: 'center' }}>
                <div style={{ flex: 1, textAlign: 'right' }}>
                    <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--cyan)' }}>⚙️ مرکز عملیات دوقلوی دیجیتال</h2>
                    <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: '4px 0 0 0' }}>مدیریت متمرکز سناریوها، پارامترها و آموزش مدل‌های هوش مصنوعی</p>
                </div>
                <div className="admin-tabs" style={{ display: 'flex', gap: '8px', direction: 'ltr' }}>
                    {[
                        { id: 'scenarios', label: 'سناریوها', icon: '🗃️' },
                        { id: 'config', label: 'تنظیمات قطعه', icon: '🛠️' },
                        { id: 'training', label: 'آموزش مدل', icon: '🧠' },
                        { id: 'logs', label: 'لاگ سیستم', icon: '📋' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as AdminTab)}
                            className={activeTab === t.id ? 'active' : ''}
                            style={{
                                padding: '10px 18px',
                                background: activeTab === t.id ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
                                border: '1px solid',
                                borderColor: activeTab === t.id ? 'var(--cyan)' : 'var(--border)',
                                color: activeTab === t.id ? 'var(--cyan)' : 'var(--text-secondary)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <span>{t.icon}</span> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="admin-content-window" style={{ textAlign: 'right' }}>
                {/* ── Tab 1: Scenario Manager ── */}
                {activeTab === 'scenarios' && (
                    <div className="tab-scenarios fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>🗃️ لیست سناریوهای فعال ({scenarios.length})</h3>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => {
                                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scenarios, null, 2));
                                        const dl = document.createElement('a');
                                        dl.setAttribute("href", dataStr);
                                        dl.setAttribute("download", "digital_twin_scenarios.json");
                                        dl.click();
                                        addLog('Scenario library exported successfully.');
                                    }}
                                    className="btn-outline"
                                >
                                    📤 خروجی JSON
                                </button>
                                <button
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    className="btn-primary"
                                    style={{ background: 'var(--cyan)', color: '#000', fontWeight: 700 }}
                                >
                                    {showAddForm ? 'انصراف' : '+ ایجاد پروفایل جدید'}
                                </button>
                            </div>
                        </div>

                        {showAddForm && (
                            <div className="glass-card fade-in" style={{ padding: '28px', marginBottom: '28px', border: '1px solid var(--cyan-dim)', background: 'rgba(0,212,255,0.02)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                    <div className="form-group">
                                        <label>نام سناریو</label>
                                        <input
                                            type="text"
                                            value={newScenario.name}
                                            onChange={e => setNewScenario({ ...newScenario, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>نوع قطعه</label>
                                        <select
                                            value={newScenario.assetType}
                                            onChange={e => setNewScenario({ ...newScenario, assetType: e.target.value as AssetType })}
                                        >
                                            <option value="supercapacitor">ابرخازن (Supercapacitor)</option>
                                            <option value="battery">باتری لیتیومی (Battery)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>وضعیت فیزیکی</label>
                                        <select
                                            value={newScenario.condition}
                                            onChange={e => setNewScenario({ ...newScenario, condition: e.target.value as DeviceCondition })}
                                        >
                                            <option value="new">قطعه نو (New)</option>
                                            <option value="aged">استهلاک یافته (Aged)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>جریان اسمی (A)</label>
                                        <input
                                            type="number"
                                            value={newScenario.current}
                                            onChange={e => setNewScenario({ ...newScenario, current: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddScenario}
                                    style={{ marginTop: '24px', padding: '12px 32px', borderRadius: '8px', background: 'var(--emerald)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}
                                >
                                    تأیید و تزریق به دوقلوی دیجیتال
                                </button>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {scenarios.map(s => (
                                <div key={s.id} className={`glass-card scenario-card ${selectedScenarioId === s.id ? 'active' : ''}`}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: s.accentColor }}>{s.name}</h4>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                                <span className="badge">{s.assetType === 'supercapacitor' ? 'ابرخازن' : 'باتری'}</span>
                                                <span className={`badge ${s.condition === 'new' ? 'green' : 'orange'}`}>
                                                    {s.condition === 'new' ? 'نو' : 'فرسوده'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => onSelectScenario(s.id)} className={`btn-select ${selectedScenarioId === s.id ? 'active' : ''}`}>
                                            {selectedScenarioId === s.id ? 'پروفایل فعال' : 'انتخاب سناریو'}
                                        </button>
                                        <button onClick={() => deleteScenario(s.id)} className="btn-delete">حذف</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Tab 2: Asset Config ── */}
                {activeTab === 'config' && (
                    <div className="tab-config fade-in">
                        <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', background: 'linear-gradient(135deg, rgba(0,212,255,0.05), transparent)', borderLeft: '4px solid var(--cyan)' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>🛠️ تنظیم دقیق پارامترهای فیزیکی قطعه</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                                این مقادیر به عنوان محدودیت‌های فیزیکی در تابع خطای (Loss Function) مدل PI-LSTM استفاده می‌شوند.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '28px' }}>
                            {Object.entries(assetParams).map(([type, conditions]) => (
                                <div key={type} className="glass-card" style={{ padding: '28px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ fontSize: '1rem', color: 'var(--cyan)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                        مشخصات فنی {type === 'supercapacitor' ? 'ابرخازن' : 'باتری'}
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
                                        {Object.entries(conditions).map(([cond, params]) => (
                                            <div key={cond}>
                                                <h5 style={{ fontSize: '0.85rem', marginBottom: '16px', color: cond === 'new' ? 'var(--emerald)' : 'var(--amber)', fontWeight: 700 }}>
                                                    {cond === 'new' ? 'حالت نو' : 'حالت مستهلک'}
                                                </h5>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    {Object.entries(params).map(([key, val]) => (
                                                        <div key={key}>
                                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>پارامتر {key}</label>
                                                            <input
                                                                type="number"
                                                                step="0.0001"
                                                                value={val}
                                                                onChange={(e) => updateAssetParams(type as AssetType, cond as any, { ...params, [key]: Number(e.target.value) })}
                                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'white' }}
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
                        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 40px auto' }}>
                            <div className="brain-animation">🧠</div>
                            <h3 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>کنسول آموزش مدل PI-LSTM (Offline)</h3>
                            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: 1.8 }}>
                                با استفاده از محدودیت‌های فیزیکی تعریف شده، شبکه عصبی را مجدداً آموزش دهید تا جابجایی پارامترها (Parameter Drift) ناشی از پیری قطعه را یاد بگیرد.
                            </p>

                            {isTraining ? (
                                <div className="training-active-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '12px' }}>
                                        <span style={{ color: 'var(--cyan)' }}>در حال بهینه‌سازی وزن‌های شبکه عصبی...</span>
                                        <span style={{ fontWeight: 800 }}>{Math.floor(trainingProgress)}%</span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar-fill" style={{ width: `${trainingProgress}%` }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>اِپاک (Epoch)</div>
                                            <div style={{ fontSize: '1.1rem', color: 'var(--cyan)', fontWeight: 700 }}>{Math.floor(trainingProgress / 5)} / 20</div>
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>خطای فیزیکی (Residual)</div>
                                            <div style={{ fontSize: '1.1rem', color: 'var(--emerald)', fontWeight: 700 }}>{(0.012 * (1 - trainingProgress / 100)).toFixed(6)}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={handleRunTraining} className="btn-train-heavy">
                                    شروع فرآیند یادگیری فیزیک-محور
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '28px' }}>
                            <div className="glass-card" style={{ padding: '28px' }}>
                                <h4 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: 'var(--emerald)' }}>●</span> تاریخچه آموزش‌های اخیر
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {[
                                        { app: 'PI-LSTM Framework', ts: '۱۴۰۲/۱۲/۱۷ ۰۹:۲۰', acc: 'دقت ۹۹.۱٪', status: 'بهینه' },
                                        { app: 'Sequential LSTM', ts: '۱۴۰۲/۱۲/۱۷ ۰۹:۱۵', acc: 'دقت ۹۵.۵٪', status: 'ناپایدار' },
                                        { app: 'Transfer Learning', ts: '۱۴۰۲/۱۲/۱۶ ۲۲:۴۰', acc: 'دقت ۹۷.۲٪', status: 'پایدار' },
                                    ].map((h, i) => (
                                        <div key={i} className="history-item">
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{h.app}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.ts}</div>
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontSize: '0.9rem', color: i === 0 ? 'var(--emerald)' : 'var(--text-secondary)' }}>{h.acc}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="glass-card" style={{ padding: '28px' }}>
                                <h4 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: 'var(--rose)' }}>●</span> مانیتورینگ سخت‌افزار (Telemetry)
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="telemetry-box">
                                        <label>دمای هسته پردازشی</label>
                                        <span style={{ color: isTraining ? 'var(--rose)' : 'var(--emerald)' }}>{isTraining ? '۷۸°C' : '۳۴°C'}</span>
                                    </div>
                                    <div className="telemetry-box">
                                        <label>مصرف حافظه VRAM</label>
                                        <span style={{ color: 'var(--cyan)' }}>{isTraining ? '۱۰.۲ GB' : '۰.۸ GB'}</span>
                                    </div>
                                    <div className="telemetry-box">
                                        <label>پهنای باند حافظه</label>
                                        <span style={{ color: 'var(--amber)' }}>{isTraining ? '۷۸۰ GB/s' : '۱۲ GB/s'}</span>
                                    </div>
                                    <div className="telemetry-box">
                                        <label>سرعت آموزش (Speed)</label>
                                        <span>{isTraining ? '۱۶۸ it/s' : '۰ it/s'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Tab 4: Logs ── */}
                {activeTab === 'logs' && (
                    <div className="tab-logs fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="status-dot"></span> جریان رخدادهای لحظه‌ای (Live Stream)
                            </h3>
                            <button onClick={clearLogs} className="btn-clear">پاکسازی حافظه</button>
                        </div>
                        <div className="log-viewer glass-card">
                            {logs.map((l, i) => (
                                <div key={i} className="log-entry">
                                    <span className="log-msg">{l}</span>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <div style={{ textAlign: 'center', marginTop: '140px', opacity: 0.5 }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📡</div>
                                    <p>در انتظار رخدادهای سیستم...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .admin-panel {
                    font-family: 'Inter', 'Vazir', sans-serif;
                }
                .scenario-card {
                    padding: 24px;
                    border: 1px solid var(--border);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .scenario-card.active {
                    border-color: var(--cyan);
                    background: rgba(0,212,255,0.05);
                    box-shadow: 0 10px 30px rgba(0,212,255,0.1);
                    transform: translateY(-4px);
                }
                .badge {
                    font-size: 0.7rem;
                    background: rgba(255,255,255,0.05);
                    padding: 3px 8px;
                    border-radius: 4px;
                    color: var(--text-muted);
                    font-weight: 600;
                }
                .badge.green { background: var(--emerald-dim); color: var(--emerald); }
                .badge.orange { background: var(--amber-dim); color: var(--amber); }

                .btn-select {
                    flex: 1;
                    padding: 10px;
                    border-radius: 6px;
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.03);
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-select.active { background: var(--cyan); color: #000; border-color: var(--cyan); }
                .btn-delete {
                    padding: 10px 14px;
                    border-radius: 6px;
                    background: rgba(244,63,94,0.1);
                    color: var(--rose);
                    border: none;
                    cursor: pointer;
                }

                .form-group label { display: block; font-size: 0.8rem; color: var(--text-muted); marginBottom: 8px; }
                .form-group input, .form-group select {
                    width: 100%; padding: 10px; border-radius: 6px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); color: white;
                }

                .brain-animation { font-size: 4rem; margin-bottom: 24px; animation: brain-float 3s infinite ease-in-out; }
                @keyframes brain-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }

                .training-active-card {
                    padding: 32px; background: rgba(0,212,255,0.04); border-radius: 16px; border: 1px solid var(--cyan-dim);
                }
                .progress-bar-container { height: 12px; background: rgba(255,255,255,0.05); border-radius: 6px; overflow: hidden; }
                .progress-bar-fill { height: 100%; background: linear-gradient(to left, var(--cyan), var(--emerald)); transition: width 0.3s; }

                .btn-train-heavy {
                    padding: 18px 48px; border-radius: 12px; background: linear-gradient(135deg, var(--cyan), var(--violet));
                    color: white; font-size: 1.1rem; font-weight: 800; border: none; cursor: pointer;
                    box-shadow: 0 10px 40px rgba(0,212,255,0.3);
                }

                .history-item {
                    display: flex; justify-content: space-between; padding: 14px; background: rgba(255,255,255,0.02);
                    border-radius: 10px; border: 1px solid var(--border);
                }

                .telemetry-box {
                    padding: 16px; background: rgba(0,0,0,0.3); border-radius: 10px; border: 1px solid var(--border);
                }
                .telemetry-box label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 6px; }
                .telemetry-box span { font-size: 1.4rem; font-weight: 900; }

                .log-viewer { height: 500px; overflow-y: auto; padding: 24px; background: #060a13; font-family: monospace; border: 1px solid var(--border); }
                .log-entry { padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.02); font-size: 0.85rem; color: #a5b4fc; }
            `}</style>
        </div>
    );
}
