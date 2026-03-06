/* ══════════════════════════════════════════════════════════════
   Multi-Asset & Ageing Scenario Data
   ══════════════════════════════════════════════════════════════ */

export type AssetType = 'supercapacitor' | 'battery';
export type DeviceCondition = 'new' | 'aged';

export interface DataPoint {
    time: number;
    current: number;
    measuredVoltage: number;
    lstmVoltage: number;
    piLstmVoltage: number;
}

export interface RCParams {
    Rs: number;
    C0: number;
    K: number;
}

export interface Scenario {
    id: string;
    name: string;
    description: string;
    profileType: string;
    currentAmplitude: string;
    duration: string;
    accentColor: string;
    data: DataPoint[];
    assetType: AssetType;
    condition: DeviceCondition;
    soh: number;
}

/* ── Base Parameters ── */
export const ASSET_PARAMS: Record<AssetType, { new: RCParams; aged: RCParams }> = {
    supercapacitor: {
        new: { Rs: 0.00022, C0: 3000, K: 29.89 },
        aged: { Rs: 0.00055, C0: 2400, K: 29.89 }, // Increased ESR, lower capacitance
    },
    battery: {
        new: { Rs: 0.015, C0: 150000, K: 0 },
        aged: { Rs: 0.035, C0: 120000, K: 0 },
    }
};

export const TRUE_PARAMS = ASSET_PARAMS.supercapacitor.new;

/* deterministic pseudo-noise */
function noise(i: number, sigma: number): number {
    const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return (x - Math.floor(x) - 0.5) * 2 * sigma;
}

/* RC simulation */
function simulate(
    currentFn: (t: number) => number,
    duration: number,
    dt: number,
    params: RCParams,
    V0: number,
    assetType: AssetType
): { time: number[]; current: number[]; voltage: number[] } {
    const steps = Math.floor(duration / dt);
    const time: number[] = [];
    const current: number[] = [];
    const voltage: number[] = [];
    let vc = V0;

    // Voltage limits based on asset
    const V_MAX = assetType === 'supercapacitor' ? 2.7 : 4.2;

    for (let i = 0; i <= steps; i++) {
        const t = i * dt;
        const I = currentFn(t);
        const vterm = vc + params.Rs * I;

        time.push(parseFloat(t.toFixed(3)));
        current.push(parseFloat(I.toFixed(3)));
        voltage.push(parseFloat(vterm.toFixed(6)));

        if (i < steps) {
            const C_eff = Math.max(1, params.C0 + params.K * Math.abs(vc));
            vc += (I * dt) / C_eff;
            vc = Math.max(0, Math.min(V_MAX, vc));
        }
    }
    return { time, current, voltage };
}

function buildScenario(
    id: string, name: string, description: string,
    profileType: string, currentAmplitude: string, accentColor: string,
    currentFn: (t: number) => number,
    duration: number, dt: number, V0: number,
    assetType: AssetType = 'supercapacitor',
    condition: DeviceCondition = 'new'
): Scenario {
    const params = ASSET_PARAMS[assetType][condition];

    // Paper-like offsets for LSTM/PI-LSTM demo
    const lstmParams = { ...params, Rs: params.Rs * 0.8, C0: params.C0 * 1.5 };
    const piLstmParams = { ...params, Rs: params.Rs * 0.9, C0: params.C0 * 1.1 };

    const trueRun = simulate(currentFn, duration, dt, params, V0, assetType);
    const lstmRun = simulate(currentFn, duration, dt, lstmParams, V0, assetType);
    const piLstmRun = simulate(currentFn, duration, dt, piLstmParams, V0, assetType);

    const data: DataPoint[] = trueRun.time.map((t, i) => ({
        time: t,
        current: trueRun.current[i],
        measuredVoltage: parseFloat((trueRun.voltage[i] + noise(i, 0.003)).toFixed(5)),
        lstmVoltage: parseFloat(lstmRun.voltage[i].toFixed(5)),
        piLstmVoltage: parseFloat(piLstmRun.voltage[i].toFixed(5)),
    }));

    const soh = condition === 'new' ? 100 : assetType === 'supercapacitor' ? 82.4 : 76.8;

    return { id, name, description, profileType, currentAmplitude, duration: `${duration} s`, accentColor, data, assetType, condition, soh };
}

/* ── Current profiles ── */
function current90A(t: number): number {
    const phase = t % 40;
    return phase < 20 ? 90 : phase < 30 ? -45 : 0;
}
function current20A(t: number): number {
    const phase = t % 60;
    return phase < 30 ? 20 : phase < 45 ? -10 : 0;
}
function current60A(t: number): number {
    const phase = t % 30;
    return phase < 15 ? 60 : phase < 22 ? -30 : 0;
}
function current140A(t: number): number {
    return 140 * Math.sin((2 * Math.PI * t) / 12)
        + 70 * Math.sin((2 * Math.PI * t) / 4)
        + 35 * Math.cos((2 * Math.PI * t) / 20);
}

// Generate permutations
export const scenarios: Scenario[] = [
    buildScenario('sc-new-90a', 'SC: 90A Cycle (New)', 'New supercapacitor cell under high current cycles.', 'Profile A', '90 A', '#00d4ff', current90A, 120, 0.5, 0.5, 'supercapacitor', 'new'),
    buildScenario('sc-aged-90a', 'SC: 90A Cycle (Aged)', 'Aged supercapacitor cell (Higher ESR, Lower Cap).', 'Profile A', '90 A', '#00d4ff', current90A, 120, 0.5, 0.5, 'supercapacitor', 'aged'),
    buildScenario('sc-new-140a', 'SC: High Stress (New)', 'New supercapacitor cell under sinusoidal stress.', 'Dynamic', '±140 A', '#f59e0b', current140A, 60, 0.2, 1.3, 'supercapacitor', 'new'),

    buildScenario('bat-new-20a', 'Battery: 20A Load (New)', 'New battery pack under steady load.', 'Standard', '20 A', '#10b981', current20A, 180, 0.5, 3.7, 'battery', 'new'),
    buildScenario('bat-new-60a', 'Battery: Dynamic (New)', 'New battery pack under transient profile.', 'Industrial', '60 A', '#a78bfa', current60A, 120, 0.5, 3.8, 'battery', 'new'),
    buildScenario('sc-aged-60a', 'Battery: Dynamic (Aged)', 'Aged battery pack with significant capacity fade.', 'Industrial', '60 A', '#a78bfa', current60A, 120, 0.5, 3.8, 'battery', 'aged'),
];

/* ── Compatibility Aliases for Offline Twin ── */
export const scenario_aliases: Record<string, string> = {
    '90a': 'sc-new-90a',
    '20a': 'bat-new-20a',
    '60a': 'bat-new-60a',
    '140a': 'sc-new-140a'
};

// Add aliases to the scenarios array for lookup by old IDs
const aliases = Object.entries(scenario_aliases).map(([oldId, newId]) => {
    const original = scenarios.find(s => s.id === newId);
    if (original) return { ...original, id: oldId };
    return null;
}).filter(Boolean) as Scenario[];

scenarios.push(...aliases);

export interface LossPoint { epoch: number; trainLoss: number; valLoss: number }
export const lstmLossData: LossPoint[] = [{ epoch: 1, trainLoss: 0.015, valLoss: 0.0087 }, { epoch: 20, trainLoss: 0.00253, valLoss: 0.0082 }];
export const piLstmLossData: LossPoint[] = [{ epoch: 1, trainLoss: 0.018, valLoss: 0.002 }, { epoch: 20, trainLoss: 0.00167, valLoss: 0.002 }];
export const trainingEfficiency = {
    lstm: { avgTime: 706.14, epochs: 20, totalTime: 14122.75, stability: 'Oscillatory' },
    piLstm: { avgTime: 513.37, epochs: 20, totalTime: 10267.40, stability: 'Stable, monotonic' },
};
export const paperMetrics = {
    lstm: { mae: 0.080, rmse: 0.093, r2: 0.955 },
    piLstm: { mae: 0.023, rmse: 0.041, r2: 0.991 },
};
export const PILSTM_PARAMS = ASSET_PARAMS.supercapacitor.new;
export const LSTM_PARAMS = { Rs: 0.000176, C0: 4500, K: 29.89 };

export const lstmTimeData = Array.from({ length: 20 }, (_, i) => ({
    epoch: i + 1,
    time: 700 + Math.random() * 45
}));

export const piLstmTimeData = Array.from({ length: 20 }, (_, i) => ({
    epoch: i + 1,
    time: 520 - i * 0.5 + Math.random() * 5
}));
