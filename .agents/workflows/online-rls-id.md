---
description: Procedure for Online Parameter Identification using RLS
---

# Online Parameter Identification Workflow

This workflow describes the process of performing real-time parameter refinement for a supercapacitor digital twin.

## 1. Offline Initialization
- Navigate to the **Admin Panel**.
- Ensure the **PI-LSTM Training** has been completed for the target asset.
- Verify that the physical constants (Rs, C0, K) are correctly set for the 'New' and 'Aged' conditions.

## 2. RLS Configuration
- Switch to the **Online Parameters** tab.
- Choose between **Case A (Warm Start)** and **Case B (Cold Start)**.
- **Warm Start** is recommended as it uses the offline-identified parameters as a robust initial guess, leading to 3-5x faster convergence.

## 3. Real-time Execution
- Click **Start RLS** to begin the sample-by-sample update loop.
- Monitor the **Voltage Reconstruction Error** (Figure 1). The error should converge below 10mV within 50 samples.
- Observe the **Parameter Convergence** (Figure 2). The estimated $R_s$ and $C_0$ should approach the reference lines within a 2% error threshold.

## 4. Adaptive Optimization
- The system automatically adjust the **Forgetting Factor ($\lambda$)** based on transient detection.
- Large voltage errors trigger a lower $\lambda$ (0.98) for faster tracking.
- Steady-state conditions use a higher $\lambda$ (0.995) for high-precision estimation.

## 5. Deployment
- Once parameters have converged, the refined digital twin can be used for State-of-Health (SOH) estimation and remaining useful life (RUL) prediction in HIL/BMS environments.
