/* ── Precomputed scenario data ──
   Uses a nonlinear‑capacitance model  C(v) = C0 + K·|v|
   to generate "measured" (with noise) and "PI‑LSTM predicted" (with
   slight parameter mismatch) voltage profiles.
*/

export interface DataPoint {
    time: number;
    current: number;
    measuredVoltage: number;
    predictedVoltage: number;
}

export interface ModelParams {
    C0: number;
    K: number;
}

export interface Scenario {
    id: string;
    name: string;
    description: string;
    profileType: string;
    duration: string;
    accentColor: string;
    modelParams: ModelParams;
    data: DataPoint[];
}

/* deterministic pseudo‑noise so charts are stable across reloads */
function noise(i: number, sigma: number): number {
    const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return (x - Math.floor(x) - 0.5) * 2 * sigma;
}

function simulate(
    currentFn: (t: number) => number,
    duration: number,
    dt: number,
    C0: number,
    K: number,
    V0: number,
): { time: number[]; current: number[]; voltage: number[] } {
    const steps = Math.floor(duration / dt);
    const time: number[] = [];
    const current: number[] = [];
    const voltage: number[] = [];
    let v = V0;
    for (let i = 0; i <= steps; i++) {
        const t = i * dt;
        const I = currentFn(t);
        time.push(parseFloat(t.toFixed(3)));
        current.push(parseFloat(I.toFixed(3)));
        voltage.push(parseFloat(v.toFixed(6)));
        if (i < steps) {
            const C_eff = Math.max(1, C0 + K * Math.abs(v));
            v += (I * dt) / C_eff;
            v = Math.max(0, Math.min(2.7, v));
        }
    }
    return { time, current, voltage };
}

/* ── True vs PI‑LSTM parameters ── */
const TRUE = { C0: 3000, K: 50 };
const LSTM = { C0: 2920, K: 45 };

function buildScenario(
    id: string,
    name: string,
    description: string,
    profileType: string,
    accentColor: string,
    currentFn: (t: number) => number,
    duration: number,
    dt: number,
    V0: number,
): Scenario {
    const trueRun = simulate(currentFn, duration, dt, TRUE.C0, TRUE.K, V0);
    const lstmRun = simulate(currentFn, duration, dt, LSTM.C0, LSTM.K, V0);

    const data: DataPoint[] = trueRun.time.map((t, i) => ({
        time: t,
        current: trueRun.current[i],
        measuredVoltage: parseFloat(
            (trueRun.voltage[i] + noise(i, 0.004)).toFixed(5),
        ),
        predictedVoltage: parseFloat(lstmRun.voltage[i].toFixed(5)),
    }));

    return {
        id,
        name,
        description,
        profileType,
        duration: `${duration} s`,
        accentColor,
        modelParams: TRUE,
        data,
    };
}

/* ── Current profiles ── */
const constantChargeCurrent = () => 100;

function stepCurrent(t: number): number {
    const period = 30;
    const phase = t % period;
    return phase < 20 ? 100 : -50;
}

function dynamicCurrent(t: number): number {
    return (
        120 * Math.sin((2 * Math.PI * t) / 15) +
        60 * Math.sin((2 * Math.PI * t) / 5) +
        30 * Math.cos((2 * Math.PI * t) / 25)
    );
}

/* ── Exported scenarios ── */
export const scenarios: Scenario[] = [
    buildScenario(
        'constant',
        'Constant Current Charge',
        'Steady 100 A charging profile — low dynamic stress. Demonstrates baseline model accuracy under constant operating conditions.',
        'Low Dynamic',
        '#00d4ff',
        constantChargeCurrent,
        80,
        0.5,
        0,
    ),
    buildScenario(
        'step',
        'Stepped Current Profile',
        'Alternating 100 A charge / −50 A discharge steps (20 s / 10 s). Represents a medium‑dynamic industrial duty cycle.',
        'Medium Dynamic',
        '#a78bfa',
        stepCurrent,
        120,
        0.5,
        1.0,
    ),
    buildScenario(
        'dynamic',
        'Highly Dynamic Pulsed Load',
        'Superposition of sinusoidal current components at different frequencies (±150 A peak). Simulates an aggressive regenerative braking / acceleration profile.',
        'Highly Dynamic',
        '#f59e0b',
        dynamicCurrent,
        60,
        0.2,
        1.3,
    ),
];
