export function mae(measured: number[], predicted: number[]): number {
    const n = measured.length;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Math.abs(measured[i] - predicted[i]);
    return sum / n;
}

export function rmse(measured: number[], predicted: number[]): number {
    const n = measured.length;
    let sum = 0;
    for (let i = 0; i < n; i++) {
        const d = measured[i] - predicted[i];
        sum += d * d;
    }
    return Math.sqrt(sum / n);
}

export function rSquared(measured: number[], predicted: number[]): number {
    const n = measured.length;
    const mean = measured.reduce((a, b) => a + b, 0) / n;
    let ssTot = 0, ssRes = 0;
    for (let i = 0; i < n; i++) {
        ssTot += (measured[i] - mean) ** 2;
        ssRes += (measured[i] - predicted[i]) ** 2;
    }
    return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
}
