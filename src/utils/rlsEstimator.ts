/* ── RLS (Recursive Least Squares) estimator ──
   Estimates parameters [a, b] of the discrete linear RC model:
     V[k+1] = a · V[k] + b · I[k]
   where  a = 1 − dt/(RC),   b = dt/C
   From which:  C = dt / b,   R = b / (1 − a)
*/

export interface RLSState {
    theta: [number, number];
    P: number[][];
    lambda: number;
}

export function createRLS(
    lambda = 0.99,
    initA = 0.9995,
    initB = 0.004,
    pScale = 500,
): RLSState {
    return {
        theta: [initA, initB],
        P: [
            [pScale, 0],
            [0, pScale],
        ],
        lambda,
    };
}

export function rlsUpdate(
    st: RLSState,
    phi: [number, number],
    y: number,
): RLSState {
    const { theta, P, lambda } = st;

    /* P · φ  (2×1) */
    const Pp0 = P[0][0] * phi[0] + P[0][1] * phi[1];
    const Pp1 = P[1][0] * phi[0] + P[1][1] * phi[1];

    /* denominator  λ + φᵀ P φ */
    const d = lambda + phi[0] * Pp0 + phi[1] * Pp1;

    /* Kalman gain */
    const K0 = Pp0 / d;
    const K1 = Pp1 / d;

    /* prediction error */
    const e = y - (theta[0] * phi[0] + theta[1] * phi[1]);

    /* θ update */
    const newTheta: [number, number] = [theta[0] + K0 * e, theta[1] + K1 * e];

    /* P update   (P − K φᵀ P) / λ */
    const phiP00 = phi[0] * P[0][0] + phi[1] * P[1][0];
    const phiP01 = phi[0] * P[0][1] + phi[1] * P[1][1];

    const newP = [
        [(P[0][0] - K0 * phiP00) / lambda, (P[0][1] - K0 * phiP01) / lambda],
        [(P[1][0] - K1 * phiP00) / lambda, (P[1][1] - K1 * phiP01) / lambda],
    ];

    return { theta: newTheta, P: newP, lambda };
}

/** Recover physical parameters from RLS θ */
export function thetaToPhysical(
    theta: [number, number],
    dt: number,
): { C: number; R: number } {
    const b = Math.max(theta[1], 1e-12);
    const a = theta[0];
    const C = dt / b;
    const oneMinusA = Math.max(1 - a, 1e-12);
    const R = b / oneMinusA;
    return { C, R };
}
