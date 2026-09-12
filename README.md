# ArchFin AI: BIM MPT Urban Optimize (v2.0)

An autonomous multi-agent AI workspace that bridges real estate quantitative finance with computational architectural engineering. By linking a responsive **React.js web dashboard** to **Autodesk Revit 2027** using the modern **Nice3point framework**, this platform extracts live market data via NVIDIA Nemotron models on Nebius Cloud, runs Markowitz Modern Portfolio Theory (MPT) matrix calculus to calculate optimal zoning allocations, and pushes changes live into the active BIM canvas.

---

## 👨‍💻 Developer Attribution & Research Foundation
*   **Principal Investigator:** Eng. Sherif Ahmad Magdaldin (Civil and Structural Engineer)
*   **Academic Matrix Core:** Master of Financial Engineering Program, WorldQuant University
*   **Scientific Reference (ICICPE 2026):** Based upon our peer-reviewed research paper: *"Generative BIM Layout Optimization via Modern Portfolio Theory."*

### 🔄 Version Progression
*   **Version 1 Prototype (*All Things Agentic Hackathon*):** Validated the core thesis linking financial MPT risk-covariance metrics with parametric BIM spatial objects using a localized, single-script coupled setup.
*   **Version 2 Workspace (*Nebius x NVIDIA Global AI Hackathon*):** Completely re-engineered into a professional, distributed web application framework. Introduces a thread-safe local sync server alongside native cloud-accelerated NVIDIA reasoning models.

---

## 🧠 Multi-Agent Execution Pipeline Topology
ArchFin AI coordinates four specialized agent phases to process real-world volatility before dynamically modifying physical design spaces:

1.  **Macro-Inference Agent (`nvidia/nemotron-3-ultra` via Nebius Token Factory):** Ingests raw unstructured text (market news summaries, commodity spikes, interest-rate updates) and extracts quantitative risk-covariance scaling multipliers (industrialRiskScale) with transparent Chain-of-Thought logs.
2.  **Quantitative MPT Agent (`math.js` Engine):** Processes the newly scaled 3 × 3 asset variance-covariance matrix Σ. Solves the constrained analytical minimum-variance portfolio weight vector mapping the financial "Efficient Frontier" curve:
    \[w^* = \frac{\Sigma^{-1} \mathbf{1}}{\mathbf{1}^T \Sigma^{-1} \mathbf{1}}\]
3.  **Adversarial Inspector Agent (`nvidia/nemotron-nano` Audit):** Continuously monitors the generated spatial footprints to enforce Floor Area Ratio (FAR) limits and long-only constraints, forcing localized calculation feedback loops if guidelines are violated.
4.  **Revit 2027 Sync Bridge (Nice3point C# Framework):** Packages the optimized weight indices and dispatches an asynchronous HTTP POST JSON payload directly back to the active desktop Revit transaction loop.

---

## 📁 Repository Directory Structure

```text
├── frontend/              # Responsive React.js Financial Dashboard UI
│   ├── src/components/    # AgentControlCenter, MPTEfficientFrontier & Stacking Visualizers
│   └── src/utils/         # Math.js Vector Matrix Solver & PDF Document Generator
├── backend/               # Autodesk Revit 2027 Nice3point C# Add-In Node
│   ├── App.cs             # Application Entry, Ribbon Extensions & HttpListener Server
│   ├── Services/          # RevitModelUpdater (Thread-safe ExternalEvent Handler)
│   ├── Models/            # UrbanAllocationPayload Object Schema Mapping
│   └── Views/             # WPF DockablePane Tracker Dashboard & Real-Time Console Logs
└── Dockerfile             # Multi-stage production container configuration file
```

---

## 🚀 Installation & Local Execution Guide

### 1. Frontend Web Dashboard (React.js)
The frontend dashboard calculates the portfolio hyperbola charts and communicates with your Nebius API keys.

```bash
# Navigate to your frontend source folder
cd frontend

# Install necessary nodes (including math.js and chart utilities)
npm install

# (Optional) Add your live Nebius Studio Key to pass direct HTTP inference strings
echo "REACT_APP_NEBIUS_API_KEY=your_nebius_key_here" > .env

# Fire up the local web deployment engine
npm run dev
```
*The optimization control panel will open up immediately on `http://localhost:3000`.*

### 2. Backend Add-In Node (Autodesk Revit 2027)
The backend leverages the modern **Nice3point framework toolkit** to execute thread-safe BIM mutations within Revit's execution thread.

1.  Open the backend project template file `backend/ArchFinAI.Backend.csproj` using **Visual Studio 2022** or JetBrains Rider.
2.  Ensure you have the `.NET 8.0` SDK installed on your machine.
3.  Build the solution (`Ctrl+Shift+B` or run `dotnet build -c Release`). The custom Post-Build targets will automatically deploy the compiled binary assemblies and the `.addin` manifest file directly to your local Revit additions folder footprint: `%AppData%\Autodesk\Revit\Addins\2027\`.
4.  Launch **Autodesk Revit 2027**. A brand-new custom **"ArchFin Agent"** Ribbon tab will materialize on your project workspace toolbar!

---

## 📡 Live Pipeline Sync Specification
When you click **"Run Pipeline"** on the React web dashboard, the calculated allocations are transmitted via an asynchronous HTTP loop directly to port `8080` on localhost. 

The Revit C# add-in's non-blocking background `HttpListener` thread catches the incoming stream, enqueues the token matrix into a safe `ConcurrentQueue`, and requests a thread-safe execution via `ExternalEvent.Raise()`. This ensures that your massing models, geometric floor count updates, and global metrics update instantly without freezing your drawing canvas.
