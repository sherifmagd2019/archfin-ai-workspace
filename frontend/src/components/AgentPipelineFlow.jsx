// src/components/AgentPipelineFlow.jsx
import React from 'react';

export default function AgentPipelineFlow({ currentStep = 0, industrialRiskScale = 1.0 }) {
  const steps = [
    {
      id: 1,
      name: "Macro-Inference Agent",
      role: "Market NLP & Risk Covariance Multiplier",
      tech: "OpenAI/Nebius Schemas",
      output: `Risk scale factor: ${industrialRiskScale.toFixed(2)}x`,
      status: currentStep >= 1 ? (currentStep === 1 ? "Active" : "Completed") : "Standby",
      color: "#89b4fa"
    },
    {
      id: 2,
      name: "Quantitative MPT Agent",
      role: "Linear Matrix Calculus & Solver",
      tech: "math.js (inv(Σ)·1) / (1'·inv(Σ)·1)",
      output: "Minimum Variance Asset Weights",
      status: currentStep >= 2 ? (currentStep === 2 ? "Active" : "Completed") : "Standby",
      color: "#a6e3a1"
    },
    {
      id: 3,
      name: "Adversarial Inspector Agent",
      role: "Boundary & Zoning Constraint Audit",
      tech: "FAR & Long-Only Enforcer Loop",
      output: "Approved Physical Zoning Vector",
      status: currentStep >= 3 ? (currentStep === 3 ? "Active" : "Completed") : "Standby",
      color: "#f9e2af"
    },
    {
      id: 4,
      name: "Revit 2027 Sync Bridge",
      role: "Nice3point Idling/ExternalEvent Dispatch",
      tech: "HTTP :8080/revit-sync/",
      output: "BIM Mass Floor Mutation",
      status: currentStep >= 4 ? "Live Dispatched" : "Standby",
      color: "#cba6f7"
    }
  ];

  return (
    <div style={{ background: '#181825', borderRadius: '12px', border: '1px solid #313244', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#bac2de' }}>
          Autonomous Multi-Agent Pipeline Topology
        </h4>
        <span style={{ fontSize: '11px', color: '#6c7086' }}>Feedback Loop Enabled</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;

          return (
            <div 
              key={step.id} 
              style={{
                background: isActive ? '#313244' : '#1e1e2e',
                border: `1px solid ${isActive ? step.color : '#313244'}`,
                borderRadius: '8px',
                padding: '12px',
                position: 'relative',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? `0 0 16px ${step.color}22` : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: step.color }}>
                  AGENT 0{step.id}
                </span>
                <span 
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: isDone ? '#a6e3a122' : isActive ? '#f9e2af22' : '#181825',
                    color: isDone ? '#a6e3a1' : isActive ? '#f9e2af' : '#6c7086',
                    fontWeight: '600'
                  }}
                >
                  {step.status}
                </span>
              </div>

              <div style={{ fontSize: '13px', fontWeight: '700', color: '#cdd6f4', marginBottom: '4px' }}>
                {step.name}
              </div>
              <div style={{ fontSize: '11px', color: '#a6adc8', marginBottom: '8px', lineHeight: '1.4' }}>
                {step.role}
              </div>

              <div style={{ background: '#11111b', padding: '6px 8px', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace', color: '#bac2de' }}>
                <div>⚙ {step.tech}</div>
                <div style={{ color: step.color, marginTop: '2px' }}>→ {step.output}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
