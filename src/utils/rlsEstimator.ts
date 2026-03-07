/* ── Generic RLS (Recursive Least Squares) estimator ──
   Supports N-dimensional parameter vector theta.
   Target model: y[k] = phi[k]^T * theta
*/

export interface RLSState {
    theta: number[];
    P: number[][]; // Covariance matrix (N x N)
    lambda: number; // Forgetting factor
}

/** 
 * Create a new RLS state
 * @param lambda Forgetting factor (0.9 to 1.0)
 * @param initTheta Initial parameter values
 * @param pScale Initial covariance scale (large for uncertainty)
 */
export function createRLS(
    lambda: number,
    initTheta: number[],
    pScale = 1000
): RLSState {
    const n = initTheta.length;
    const P = Array(n).fill(0).map((_, i) =>
        Array(n).fill(0).map((_, j) => (i === j ? pScale : 0))
    );

    return {
        theta: [...initTheta],
        P,
        lambda,
    };
}

/**
 * Standard RLS Update step
 * @param st Current RLS state
 * @param phi Regressor vector (N dimensions)
 * @param y Measured output scalar
 */
export function rlsUpdate(
    st: RLSState,
    phi: number[],
    y: number
): RLSState {
    const { theta, P, lambda } = st;
    const n = theta.length;

    // 1. Calculate P * phi -> (n x 1)
    const Pphi = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            Pphi[i] += P[i][j] * phi[j];
        }
    }

    // 2. Denominator: lambda + phi^T * P * phi
    let denom = lambda;
    for (let i = 0; i < n; i++) {
        denom += phi[i] * Pphi[i];
    }

    // 3. Kalman Gain: K = P * phi / denom
    const K = Pphi.map(v => v / denom);

    // 4. Prediction error: e = y - phi^T * theta
    let pred = 0;
    for (let i = 0; i < n; i++) {
        pred += phi[i] * theta[i];
    }
    const e = y - pred;

    // 5. Update theta: theta = theta + K * e
    const newTheta = theta.map((v, i) => v + K[i] * e);

    // 6. Update P: P = (P - K * phi^T * P) / lambda
    // Precompute phi^T * P -> (1 x n)
    const phiTP = Array(n).fill(0);
    for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {
            phiTP[j] += phi[i] * P[i][j];
        }
    }

    const newP = Array(n).fill(0).map((_, i) =>
        Array(n).fill(0).map((_, j) =>
            (P[i][j] - K[i] * phiTP[j]) / lambda
        )
    );

    return { theta: newTheta, P: newP, lambda };
}

/**
 * Enhanced RLS Update with projection and adaptive lambda
 */
export function rlsUpdateEnhanced(
    st: RLSState,
    phi: number[],
    y: number,
    lambda: number,
    bounds: { min: number[], max: number[] }
): RLSState {
    const updated = rlsUpdate({ ...st, lambda }, phi, y);

    // Parameter Projection (Clipping)
    const projectedTheta = updated.theta.map((v, i) =>
        Math.max(bounds.min[i], Math.min(bounds.max[i], v))
    );

    return { ...updated, theta: projectedTheta };
}

/** 
 * Map theta [theta1, theta2, theta3] to physical SC parameters [Rs, C0, K]
 * Based on the discrete model matching the report's 3x3 requirement.
 */
export function mapToPhysicalSC(theta: number[], dt: number): { Rs: number; C0: number; K: number } {
    return {
        Rs: theta[0],
        C0: Math.max(10, theta[1]),
        K: theta[2] || 0
    };
}
