/* ══════════════════════════════════════════════════════════════
   Paper-based scenario data — CapTop 3000 F supercapacitor
   ══════════════════════════════════════════════════════════════
   Nonlinear RC model:
     C(v) = C₀ + K·|v|
     v_C(k+1) = v_C(k) + Ts·i(k) / C(v_C(k))
     v_term(k) = v_C(k) + Rs·i(k)

   Identified Parameters (Table 1):
   ┌─────────────┬──────────┬──────────┬──────────┐
   │ Model       │ Rs [mΩ]  │ C₀ [F]   │ K [F/V]  │
   ├─────────────┼──────────┼──────────┼──────────┤
   │ LSTM        │ 0.0697   │ 5979.56  │ 29.89    │
   │ PI-LSTM     │ 0.0597   │ 3979.56  │ 29.89    │
   └─────────────┴──────────┴──────────┴──────────┘
*/

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
}

/* ── Paper parameters ── */
export const TRUE_PARAMS: RCParams = { Rs: 0.00022, C0: 3000, K: 29.89 };
export const LSTM_PARAMS: RCParams = { Rs: 0.0000697, C0: 5979.56, K: 29.89 };
export const PILSTM_PARAMS: RCParams = { Rs: 0.0000597, C0: 3979.56, K: 29.89 };

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
): { time: number[]; current: number[]; voltage: number[] } {
    const steps = Math.floor(duration / dt);
    const time: number[] = [];
    const current: number[] = [];
    const voltage: number[] = [];
    let vc = V0;

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
            vc = Math.max(0, Math.min(2.7, vc));
        }
    }
    return { time, current, voltage };
}

function buildScenario(
    id: string, name: string, description: string,
    profileType: string, currentAmplitude: string, accentColor: string,
    currentFn: (t: number) => number,
    duration: number, dt: number, V0: number,
): Scenario {
    const trueRun = simulate(currentFn, duration, dt, TRUE_PARAMS, V0);
    const lstmRun = simulate(currentFn, duration, dt, LSTM_PARAMS, V0);
    const piLstmRun = simulate(currentFn, duration, dt, PILSTM_PARAMS, V0);

    const data: DataPoint[] = trueRun.time.map((t, i) => ({
        time: t,
        current: trueRun.current[i],
        measuredVoltage: parseFloat((trueRun.voltage[i] + noise(i, 0.003)).toFixed(5)),
        lstmVoltage: parseFloat(lstmRun.voltage[i].toFixed(5)),
        piLstmVoltage: parseFloat(piLstmRun.voltage[i].toFixed(5)),
    }));

    return { id, name, description, profileType, currentAmplitude, duration: `${duration} s`, accentColor, data };
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

export const scenarios: Scenario[] = [
    buildScenario('90a', '90 A Evaluation Profile',
        'Primary evaluation profile used for RC parameter identification and LSTM / PI‑LSTM training. Contains charge / discharge cycles at 90 A with rest periods.',
        'Evaluation', '90 A', '#00d4ff', current90A, 120, 0.5, 0.5),
    buildScenario('20a', '20 A Low-Current (Simulink)',
        'Simulink validation under low-current excitation. Tests generalization of offline-identified parameters under gentle conditions.',
        'Simulink · Low', '20 A', '#10b981', current20A, 180, 0.5, 0.5),
    buildScenario('60a', '60 A Medium-Transient (Simulink)',
        'Simulink validation under medium transient excitation. Moderate industrial duty cycle with charge / discharge steps.',
        'Simulink · Medium', '60 A', '#a78bfa', current60A, 120, 0.5, 0.5),
    buildScenario('140a', '140 A High-Current Stress (Simulink)',
        'Simulink validation under aggressive high-current stress. Superimposed sinusoidal components simulate regenerative braking.',
        'Simulink · High', '±140 A', '#f59e0b', current140A, 60, 0.2, 1.3),
];

/* ── Training loss data (matching paper Figures 5 & 6) ── */
export interface LossPoint { epoch: number; trainLoss: number; valLoss: number }

/* LSTM: train drops sharply → ~0.003, val stays ~0.008 with mild oscillation */
export const lstmLossData: LossPoint[] = [
    { epoch: 1, trainLoss: 0.01500, valLoss: 0.00870 },
    { epoch: 2, trainLoss: 0.00600, valLoss: 0.00850 },
    { epoch: 3, trainLoss: 0.00380, valLoss: 0.00830 },
    { epoch: 4, trainLoss: 0.00320, valLoss: 0.00800 },
    { epoch: 5, trainLoss: 0.00300, valLoss: 0.00810 },
    { epoch: 6, trainLoss: 0.00290, valLoss: 0.00790 },
    { epoch: 7, trainLoss: 0.00285, valLoss: 0.00870 },
    { epoch: 8, trainLoss: 0.00280, valLoss: 0.00820 },
    { epoch: 9, trainLoss: 0.00278, valLoss: 0.00800 },
    { epoch: 10, trainLoss: 0.00275, valLoss: 0.00810 },
    { epoch: 11, trainLoss: 0.00273, valLoss: 0.00830 },
    { epoch: 12, trainLoss: 0.00270, valLoss: 0.00810 },
    { epoch: 13, trainLoss: 0.00268, valLoss: 0.00820 },
    { epoch: 14, trainLoss: 0.00265, valLoss: 0.00800 },
    { epoch: 15, trainLoss: 0.00263, valLoss: 0.00810 },
    { epoch: 16, trainLoss: 0.00260, valLoss: 0.00820 },
    { epoch: 17, trainLoss: 0.00258, valLoss: 0.00810 },
    { epoch: 18, trainLoss: 0.00256, valLoss: 0.00820 },
    { epoch: 19, trainLoss: 0.00255, valLoss: 0.00810 },
    { epoch: 20, trainLoss: 0.00253, valLoss: 0.00820 },
];

/* PI-LSTM: train drops sharply → ~0.002, val closely matched, stable */
export const piLstmLossData: LossPoint[] = [
    { epoch: 1, trainLoss: 0.01800, valLoss: 0.00200 },
    { epoch: 2, trainLoss: 0.00350, valLoss: 0.00260 },
    { epoch: 3, trainLoss: 0.00230, valLoss: 0.00250 },
    { epoch: 4, trainLoss: 0.00210, valLoss: 0.00260 },
    { epoch: 5, trainLoss: 0.00200, valLoss: 0.00250 },
    { epoch: 6, trainLoss: 0.00195, valLoss: 0.00240 },
    { epoch: 7, trainLoss: 0.00190, valLoss: 0.00260 },
    { epoch: 8, trainLoss: 0.00188, valLoss: 0.00250 },
    { epoch: 9, trainLoss: 0.00185, valLoss: 0.00240 },
    { epoch: 10, trainLoss: 0.00183, valLoss: 0.00260 },
    { epoch: 11, trainLoss: 0.00180, valLoss: 0.00240 },
    { epoch: 12, trainLoss: 0.00178, valLoss: 0.00235 },
    { epoch: 13, trainLoss: 0.00176, valLoss: 0.00230 },
    { epoch: 14, trainLoss: 0.00175, valLoss: 0.00225 },
    { epoch: 15, trainLoss: 0.00173, valLoss: 0.00220 },
    { epoch: 16, trainLoss: 0.00172, valLoss: 0.00215 },
    { epoch: 17, trainLoss: 0.00170, valLoss: 0.00210 },
    { epoch: 18, trainLoss: 0.00169, valLoss: 0.00210 },
    { epoch: 19, trainLoss: 0.00168, valLoss: 0.00205 },
    { epoch: 20, trainLoss: 0.00167, valLoss: 0.00200 },
];

/* ── Training efficiency — Table 2 ── */
export const trainingEfficiency = {
    lstm: { avgTime: 706.14, epochs: 20, totalTime: 14122.75, stability: 'Oscillatory' },
    piLstm: { avgTime: 513.37, epochs: 20, totalTime: 10267.40, stability: 'Stable, monotonic' },
};

/* ── Training time per epoch (matching paper Figures 7 & 8) ── */
export interface TimePoint { epoch: number; time: number }

/* LSTM: ~700-745s, oscillatory around 706 avg */
export const lstmTimeData: TimePoint[] = [
    { epoch: 1, time: 710 }, { epoch: 2, time: 742 }, { epoch: 3, time: 708 },
    { epoch: 4, time: 707 }, { epoch: 5, time: 710 }, { epoch: 6, time: 712 },
    { epoch: 7, time: 720 }, { epoch: 8, time: 715 }, { epoch: 9, time: 708 },
    { epoch: 10, time: 703 }, { epoch: 11, time: 715 }, { epoch: 12, time: 718 },
    { epoch: 13, time: 706 }, { epoch: 14, time: 710 }, { epoch: 15, time: 704 },
    { epoch: 16, time: 705 }, { epoch: 17, time: 703 }, { epoch: 18, time: 706 },
    { epoch: 19, time: 704 }, { epoch: 20, time: 712 },
];

/* PI-LSTM: ~515-535s, mild oscillation around 513 avg */
export const piLstmTimeData: TimePoint[] = [
    { epoch: 1, time: 530 }, { epoch: 2, time: 520 }, { epoch: 3, time: 517 },
    { epoch: 4, time: 518 }, { epoch: 5, time: 515 }, { epoch: 6, time: 520 },
    { epoch: 7, time: 525 }, { epoch: 8, time: 522 }, { epoch: 9, time: 526 },
    { epoch: 10, time: 528 }, { epoch: 11, time: 518 }, { epoch: 12, time: 515 },
    { epoch: 13, time: 520 }, { epoch: 14, time: 522 }, { epoch: 15, time: 530 },
    { epoch: 16, time: 520 }, { epoch: 17, time: 528 }, { epoch: 18, time: 522 },
    { epoch: 19, time: 520 }, { epoch: 20, time: 515 },
];

/* ── Paper metrics for 90 A profile ── */
export const paperMetrics = {
    lstm: { mae: 0.080, rmse: 0.093, r2: 0.955 },
    piLstm: { mae: 0.023, rmse: 0.041, r2: 0.991 },
};
