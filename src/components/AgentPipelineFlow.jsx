import { Bot, Cpu, ShieldCheck, Radio, Sparkles } from 'lucide-react';

export default function AgentPipelineFlow({ currentStep, industrialRiskScale, selectedModel }) {
  const displayModel = selectedModel ? selectedModel.replace("nvidia/", "") : "nemotron-3-ultra";

  const agents = [
    {
      step: 1,
      name: "Macro-Inference Agent",
      icon: Bot,
      role: `NVIDIA ${displayModel}`,
      detail: "Nebius Token Factory serverless endpoint",
      badge: `Risk Scale: ${industrialRiskScale.toFixed(2)}x`,
      color: "#89b4fa"
    },
    {
      step: 2,
      name: "Quantitative MPT Agent",
      icon: Cpu,
      role: "Markowitz Min-Variance Solver",
      detail: "math.js calculus: w* = (Σ⁻¹·1)/(1'·Σ⁻¹·1)",
      badge: "Eigen-Matrix Inversion",
      color: "#a6e3a1"
    },
    {
      step: 3,
      name: "Adversarial Inspector Agent",
      icon: ShieldCheck,
      role: "Architectural & FAR Auditing",
      detail: "Audits physical zoning limits; loops back if broken",
      badge: "Zoning Constraint Loop",
      color: "#f9e2af"
    },
    {
      step: 4,
      name: "Revit 2027 Sync Bridge",
      icon: Radio,
      role: "Nice3point ExternalEvent Dispatch",
      detail: "Live marshaling into Revit document transaction",
      badge: "HTTP :8080 Listener",
      color: "#cba6f7"
    }
  ];

  return (
    <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xs uppercase font-bold tracking-widest text-[#a6adc8]">
              Multi-Agent Execution Pipeline Topology
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#89b4fa]/15 text-[#89b4fa] border border-[#89b4fa]/30 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Nebius Token Factory · NVIDIA Nemotron
            </span>
          </div>
          <p className="text-xs text-[#6c7086] mt-0.5">Closed-loop Macroeconomic Inference to Physical Revit BIM Mutation</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#a6e3a1] animate-pulse" />
          <span className="text-xs font-mono text-[#a6adc8]">Active Model: {displayModel}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isActive = currentStep === agent.step;
          const isDone = currentStep > agent.step;

          return (
            <div
              key={agent.step}
              className={`rounded-lg p-3.5 border transition-all duration-300 relative ${
                isActive
                  ? 'bg-[#313244] border-current shadow-lg ring-1'
                  : isDone
                  ? 'bg-[#181825] border-[#45475a]'
                  : 'bg-[#181825]/60 border-[#313244]'
              }`}
              style={{
                borderColor: isActive ? agent.color : undefined,
                boxShadow: isActive ? `0 0 15px ${agent.color}33` : undefined
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: `${agent.color}22`,
                    color: agent.color
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className="text-[10px] uppercase font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: isDone ? '#a6e3a122' : isActive ? `${agent.color}22` : '#313244',
                    color: isDone ? '#a6e3a1' : isActive ? agent.color : '#6c7086'
                  }}
                >
                  {isDone ? 'Completed' : isActive ? 'Processing' : 'Standby'}
                </span>
              </div>

              <div className="text-xs font-bold text-[#cdd6f4] mb-0.5">
                {agent.name}
              </div>
              <div className="text-[11px] text-[#a6adc8] mb-2 leading-tight">
                {agent.role}
              </div>

              <div className="bg-[#11111b] p-2 rounded text-[10px] font-mono text-[#a6adc8]">
                <div className="text-[#6c7086] truncate">{agent.detail}</div>
                <div className="font-semibold mt-1" style={{ color: agent.color }}>
                  {agent.badge}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
