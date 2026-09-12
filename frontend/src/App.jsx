import { useState } from 'react';
import AgentControlCenter from './components/AgentControlCenter';
import AgentPipelineFlow from './components/AgentPipelineFlow';
import MPTEfficientFrontier from './components/MPTEfficientFrontier';
import UrbanLayoutVisualizer from './components/UrbanLayoutVisualizer';
import RevitSyncStatusBadge from './components/RevitSyncStatusBadge';
import BlueprintCodeViewer from './components/BlueprintCodeViewer';
import ResearchPaperModal from './components/ResearchPaperModal';
import { downloadPaperPdf } from './utils/generatePaperPdf';
import { Building, Code2, LayoutDashboard, Cpu, Award, BookOpen, Download, FileText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);

  const [pipelineState, setPipelineState] = useState({
    allocations: { Res: "33.3", Comm: "33.3", Ind: "33.4" },
    covarianceMatrix: [
      [0.004, 0.001, 0.002],
      [0.001, 0.008, 0.003],
      [0.002, 0.003, 0.006]
    ],
    industrialRiskScale: 1.0,
    marketInput: "Rapid construction steel price inflation paired with retail cooling trends.",
    statusText: "Ready",
    currentStep: 0,
    syncStatus: 'idle'
  });

  const [simulatedSync, setSimulatedSync] = useState(true);

  return (
    <div className="min-h-screen bg-[#11111b] text-[#cdd6f4] font-sans antialiased selection:bg-[#89b4fa]/30 selection:text-[#cdd6f4]">
      {/* Top Ribbon with Developer Attribution & Research Paper Reference */}
      <div className="bg-gradient-to-r from-[#181825] via-[#1e1e2e] to-[#181825] border-b border-[#313244] px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#89b4fa]/15 text-[#89b4fa] font-bold border border-[#89b4fa]/30 shadow-sm">
              <Award className="w-3.5 h-3.5 text-[#f9e2af]" />
              <span>Developed by : Eng. Sherif Ahmad Magdaldin</span>
            </span>
            <span className="text-[#6c7086] hidden md:inline">|</span>
            <span className="text-[#a6adc8] hidden md:inline text-[11px]">
              Civil and Structural Engineer · Master of Financial Engineering (WorldQuant University)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#a6adc8] text-[11px] hidden xl:inline">
              ICICPE 2026 Reference: <strong className="text-[#cdd6f4]">Modern Portfolio Theory in BIM</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsPaperModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] text-xs font-semibold transition-colors cursor-pointer border border-[#45475a]/50"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#89b4fa]" />
              <span>Read Paper</span>
            </button>
            <button
              type="button"
              onClick={() => downloadPaperPdf()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#a6e3a1]/20 hover:bg-[#a6e3a1]/30 text-[#a6e3a1] border border-[#a6e3a1]/40 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Paper (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Navbar */}
      <header className="border-b border-[#313244] bg-[#181825]/90 backdrop-blur sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#89b4fa] to-[#b4befe] flex items-center justify-center text-[#11111b] font-black text-lg shadow-md">
              AF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-[#cdd6f4] tracking-tight">
                  ArchFin AI: BIM MPT Urban Optimize
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#a6e3a1]/15 text-[#a6e3a1] border border-[#a6e3a1]/30">
                  Revit 2027 Ready
                </span>
              </div>
              <p className="text-xs text-[#a6adc8]">
                Computational Architectural Engineering · Multi-Agent MPT Optimization
              </p>
            </div>
          </div>

          {/* Navigation Mode Switcher */}
          <div className="flex items-center gap-2 bg-[#11111b] p-1 rounded-xl border border-[#313244]">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#89b4fa] text-[#11111b] shadow'
                  : 'text-[#a6adc8] hover:text-[#cdd6f4]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Live Optimization Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('blueprint')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'blueprint'
                  ? 'bg-[#89b4fa] text-[#11111b] shadow'
                  : 'text-[#a6adc8] hover:text-[#cdd6f4]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Revit 2027 Nice3point Blueprint</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPaperModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#a6adc8] hover:text-[#cdd6f4] transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#f9e2af]" />
              <span>Research Paper</span>
            </button>
          </div>

          {/* Tech Badges */}
          <div className="hidden xl:flex items-center gap-2">
            <div className="text-xs bg-[#313244] px-2.5 py-1 rounded-md text-[#a6adc8] flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#a6e3a1]" />
              <span>math.js MPT Solver</span>
            </div>
            <div className="text-xs bg-[#313244] px-2.5 py-1 rounded-md text-[#a6adc8] flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-[#89b4fa]" />
              <span>C# / .NET 8</span>
            </div>
          </div>
        </div>
      </header>

      {/* Research Paper Modal */}
      <ResearchPaperModal
        isOpen={isPaperModalOpen}
        onClose={() => setIsPaperModalOpen(false)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {activeTab === 'dashboard' ? (
          <>
            {/* Multi-Agent Topology Visualizer */}
            <AgentPipelineFlow
              currentStep={pipelineState.currentStep}
              industrialRiskScale={pipelineState.industrialRiskScale}
            />

            {/* Dashboard 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Agent Controller & Revit Pipeline */}
              <div className="lg:col-span-6 space-y-6">
                <AgentControlCenter
                  onPipelineUpdate={setPipelineState}
                  pipelineState={pipelineState}
                  simulatedSync={simulatedSync}
                />

                <RevitSyncStatusBadge
                  lastPayload={pipelineState.lastPayload}
                  simulatedSync={simulatedSync}
                  setSimulatedSync={setSimulatedSync}
                  syncStatus={pipelineState.syncStatus}
                />
              </div>

              {/* Right Column: Physical BIM Massing Simulator & MPT Math Matrix */}
              <div className="lg:col-span-6 space-y-6">
                <UrbanLayoutVisualizer allocations={pipelineState.allocations} />

                <MPTEfficientFrontier
                  allocations={pipelineState.allocations}
                  covarianceMatrix={pipelineState.covarianceMatrix}
                  industrialRiskScale={pipelineState.industrialRiskScale}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#1e1e2e] border border-[#313244] p-5 rounded-xl">
              <h2 className="text-base font-bold text-[#cdd6f4] mb-1">
                Autodesk Revit 2027 Add-in Architecture Specification
              </h2>
              <p className="text-xs text-[#a6adc8] leading-relaxed">
                The backend workspace is cleanly partitioned into <code className="text-[#89b4fa]">backend/</code> (C#/.NET 8 Nice3point Revit 2027 external application) and <code className="text-[#a6e3a1]">frontend/</code> (JavaScript React financial layout dashboard). Inspect the production-grade source files below, deployable directly into Revit 2027.
              </p>
            </div>

            <BlueprintCodeViewer />

            {/* Workspace Directory Structure */}
            <div className="bg-[#1e1e2e] border border-[#313244] p-5 rounded-xl">
              <h3 className="text-xs uppercase font-bold tracking-wider text-[#a6adc8] mb-3">
                Workspace Directory Partitioning
              </h3>
              <div className="bg-[#11111b] p-4 rounded-lg font-mono text-xs text-[#cdd6f4] space-y-1 overflow-x-auto">
                <div>📁 <span className="text-[#89b4fa] font-bold">backend/</span> (Autodesk Revit 2027 Nice3point C#/.NET 8 Add-in)</div>
                <div className="pl-4">├── 📄 ArchFinAI.Backend.csproj (Targets net8.0-windows, Nice3point.Revit.Toolkit 2027.0.0)</div>
                <div className="pl-4">├── 📄 ArchFinAI.addin (Revit 2027 Addin Manifest)</div>
                <div className="pl-4">├── 📄 App.cs (Nice3point RevitApplication with HttpListener :8080)</div>
                <div className="pl-4">├── 📁 Commands/</div>
                <div className="pl-8">├── 📄 LaunchDashboardCommand.cs (Launches browser to React frontend)</div>
                <div className="pl-8">└── 📄 ShowDockablePaneCommand.cs (Toggles live telemetry DockablePane)</div>
                <div className="pl-4">├── 📁 Models/</div>
                <div className="pl-8">└── 📄 UrbanAllocationPayload.cs (Residential, Commercial, Industrial weights)</div>
                <div className="pl-4">├── 📁 Services/</div>
                <div className="pl-8">└── 📄 RevitModelUpdater.cs (Thread-safe IExternalEventHandler & Transactions)</div>
                <div className="pl-4">├── 📁 Views/</div>
                <div className="pl-8">├── 📄 AgentDashboardDockablePane.xaml (WPF Contextual Dashboard)</div>
                <div className="pl-8">└── 📄 AgentDashboardDockablePane.xaml.cs (IDockablePaneProvider code-behind)</div>
                <div className="pl-4">├── 📄 install-addin.ps1 (One-click build & deploy PowerShell script)</div>
                <div className="pl-4">└── 📄 README.md (Technical architecture & thread safety guidelines)</div>
                <div className="mt-2">📁 <span className="text-[#a6e3a1] font-bold">frontend/</span> (JavaScript React Financial Layout Engineering Dashboard)</div>
                <div className="pl-4">├── 📄 package.json (mathjs, react, lucide-react)</div>
                <div className="pl-4">├── 📄 vite.config.js (Vite server port 3000)</div>
                <div className="pl-4">├── 📄 index.html</div>
                <div className="pl-4">├── 📁 src/</div>
                <div className="pl-8">├── 📄 main.jsx (React 19 entry point)</div>
                <div className="pl-8">├── 📄 App.jsx</div>
                <div className="pl-8">├── 📁 components/</div>
                <div className="pl-12">├── 📄 AgentControlCenter.jsx (MPT Math & Revit Sync fetch)</div>
                <div className="pl-12">├── 📄 AgentPipelineFlow.jsx (3-step multi-agent diagram)</div>
                <div className="pl-12">├── 📄 MPTEfficientFrontier.jsx (Covariance matrix & Sharpe ratio)</div>
                <div className="pl-12">├── 📄 UrbanLayoutVisualizer.jsx (3D Mass floors & parcel zoning)</div>
                <div className="pl-12">└── 📄 RevitSyncStatusBadge.jsx (Listener ping & payload spec)</div>
                <div className="pl-4">└── 📄 README.md (MPT linear algebra & Nebius/OpenAI swap guide)</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#313244] bg-[#181825] px-6 py-4 mt-12 text-xs text-[#6c7086]">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-0.5">
            <div className="text-[#cdd6f4] font-medium flex items-center gap-1.5">
              <span>ArchFin AI: BIM MPT Urban Optimize</span>
              <span>·</span>
              <span className="text-[#89b4fa]">Developed by : Eng. Sherif Ahmad Magdaldin</span>
            </div>
            <div className="text-[#a6adc8] text-[11px]">
              Civil and Structural Engineer · Master of Financial Engineering Program, WorldQuant University
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPaperModalOpen(true)}
              className="text-[#89b4fa] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3 h-3" />
              <span>Scientific Paper Reference (ICICPE 2026)</span>
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => downloadPaperPdf()}
              className="text-[#a6e3a1] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
