# ArchFin AI: Frontend (React.js Optimization Dashboard)

Modern web dashboard for financial urban layout engineering, executing Modern Portfolio Theory (MPT) linear matrix transformations in client-side WebAssembly/JavaScript using `math.js`, and synchronizing real-time allocation vectors to Autodesk Revit 2027.

## Nebius Global AI Hackathon Integration

ArchFin AI is architected specifically for the **Nebius Global AI Hackathon** (Best Apps & Agents Track) utilizing **Nebius Token Factory** serverless endpoints with open-source **NVIDIA Nemotron models**:

- **`nvidia/nemotron-3-ultra`** (*Hackathon Preferred for Serious Reasoning*):
  - Solves multi-agent macroeconomic covariance formulations and complex constraints.
  - Formulates cross-asset volatility scalar adjustments ($\text{industrialRiskScale}$) based on market shocks (e.g. steel price spikes, supply chain disruptions).
- **`nvidia/Llama-3.1-Nemotron-70B-Instruct`**:
  - High-precision textual NLP ingestion of financial narratives, city zoning bylaws, and interest-rate expectations.
- **`nvidia/nemotron-4-340b-instruct`**:
  - Frontier-scale architectural and civil spatial reasoning.
- **`nvidia/nemotron-nano`**:
  - Low-latency edge execution for physical FAR (Floor Area Ratio) boundary and non-negativity audits.

### API Configuration
Nebius Token Factory provides an OpenAI-compatible REST endpoint:
- **Base URL**: `https://api.studio.nebius.ai/v1/chat/completions`
- **Authentication**: `Bearer <NEBIUS_API_KEY>`
- **Live / Offline Mode**: The UI includes a toggle between live Nebius Token Factory inference and a local deterministic Nemotron Chain-of-Thought simulation engine, ensuring presentations and hackathon judges can evaluate the system seamlessly in all environments.

## Multi-Agent Architecture

The frontend coordinates four specialized agent phases:

1. **Macro-Inference Agent (NVIDIA Nemotron via Nebius Token Factory)**:
   - Ingests macroeconomic market narrative text (e.g. steel inflation, supply-chain crunches, retail cooling trends).
   - Generates risk covariance adjustment constants ($\text{industrialRiskScale}$, $\text{commercialRiskScale}$, $\text{residentialRiskScale}$) with transparent Chain-of-Thought reasoning.

2. **Quantitative MPT Agent**:
   - Constructs the adjusted variance-covariance matrix $\Sigma \in \mathbb{R}^{3 \times 3}$.
   - Solves the constrained analytical minimum-variance optimization problem:
     $$w^* = \frac{\Sigma^{-1} \mathbf{1}}{\mathbf{1}^T \Sigma^{-1} \mathbf{1}}$$
   - Executes matrix inversion, matrix multiplication, and inner product scaling via `math.js`.

3. **Adversarial Inspector Agent**:
   - Verifies physical architectural feasibility constraints:
     - Long-only non-negative weight constraint ($w_i \ge 0$).
     - Floor Area Ratio (FAR) boundary constraints ($10\% \le w_i \le 80\%$).
   - If constraints are violated, loops back to the solver with projected constraints.

4. **Revit 2027 Pipeline Transmitter**:
   - Packages the allocation weights (`residential`, `commercial`, `industrial`, `alertText`, `modelUsed`, `provider`).
   - Transmits HTTP POST JSON to `http://localhost:8080/revit-sync/`.

## Running the Dashboard

```bash
npm install
npm run dev
```

Dashboard will start on `http://localhost:3000`.
Ensure Autodesk Revit 2027 with the ArchFin Add-in is running with the `http://localhost:8080/revit-sync/` listener active.

