import { useState } from 'react';
import {
  MessageSquare,
  Bot,
  Cpu,
  ShieldCheck,
  Sparkles,
  Network,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';

const AGENT_META = {
  MacroInferenceAgent: {
    name: 'Macro-Inference Agent',
    role: 'Macroeconomic NLP & Sentiment Analyst',
    avatar: Bot,
    color: '#89b4fa',
    bgColor: 'rgba(137, 180, 250, 0.15)',
    borderColor: '#89b4fa'
  },
  QuantitativeMPTAgent: {
    name: 'Quantitative MPT Agent',
    role: 'Markowitz Min-Variance Matrix Solver',
    avatar: Cpu,
    color: '#a6e3a1',
    bgColor: 'rgba(166, 227, 161, 0.15)',
    borderColor: '#a6e3a1'
  },
  AdversarialInspectorAgent: {
    name: 'Adversarial Inspector Agent',
    role: 'Zoning & Municipal Code Auditor',
    avatar: ShieldCheck,
    color: '#f9e2af',
    bgColor: 'rgba(249, 226, 175, 0.15)',
    borderColor: '#f9e2af'
  },
  ExecutiveExplainerAgent: {
    name: 'Executive Explainer Agent',
    role: 'Executive Synthesis & Decision Architect',
    avatar: Sparkles,
    color: '#cba6f7',
    bgColor: 'rgba(203, 166, 247, 0.15)',
    borderColor: '#cba6f7'
  },
  RevitSyncAgent: {
    name: 'Revit Sync Agent',
    role: 'BIM Mutation Dispatcher',
    avatar: Network,
    color: '#fab387',
    bgColor: 'rgba(250, 179, 135, 0.15)',
    borderColor: '#fab387'
  }
};

export default function InterAgentDialogueViewer({ dialogue = [], isRunning = false }) {
  const [filterAgent, setFilterAgent] = useState('ALL');
  const [isExpanded, setIsExpanded] = useState(true);

  const displayedTurns = (filterAgent === 'ALL'
    ? dialogue
    : dialogue.filter(t => t.sender === filterAgent || t.recipient === filterAgent)
  ) || [];

  return (
    <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#313244]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#cba6f7]/15 text-[#cba6f7] rounded-lg">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#cdd6f4]">
                Inter-Agent Live Dialogue & Conversation Stream
              </h3>
              {dialogue.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#89b4fa]/20 text-[#89b4fa] border border-[#89b4fa]/30 font-bold">
                  {dialogue.length} Turns Exchanged
                </span>
              )}
            </div>
            <p className="text-xs text-[#a6adc8]">
              Autonomous negotiation and debate between Macro, Quantitative, Adversarial, and BIM agents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Agent Filter */}
          <div className="flex items-center gap-1 bg-[#181825] px-2 py-1 rounded-lg border border-[#313244] text-xs">
            <Filter className="w-3.5 h-3.5 text-[#a6adc8]" />
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="bg-transparent text-[#cdd6f4] text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#1e1e2e]">All Agents</option>
              <option value="MacroInferenceAgent" className="bg-[#1e1e2e]">Macro-Inference</option>
              <option value="QuantitativeMPTAgent" className="bg-[#1e1e2e]">Quantitative MPT</option>
              <option value="AdversarialInspectorAgent" className="bg-[#1e1e2e]">Adversarial Inspector</option>
              <option value="ExecutiveExplainerAgent" className="bg-[#1e1e2e]">Executive Explainer</option>
              <option value="RevitSyncAgent" className="bg-[#1e1e2e]">Revit Sync</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Dialogue Content */}
      {isExpanded && (
        <div className="space-y-3">
          {displayedTurns.length === 0 ? (
            <div className="bg-[#181825] border border-dashed border-[#313244] rounded-xl p-8 text-center">
              <MessageSquare className="w-8 h-8 text-[#6c7086] mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-[#a6adc8]">
                No inter-agent dialogue recorded yet.
              </p>
              <p className="text-[11px] text-[#6c7086] mt-1">
                Click <strong className="text-[#89b4fa]">"Run Multi-Agent Optimization Engine"</strong> to observe autonomous debate, matrix negotiations, and zoning audits.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
              {displayedTurns.map((turn, index) => {
                const senderMeta = AGENT_META[turn.sender] || {
                  name: turn.sender,
                  role: turn.role || 'Autonomous Agent',
                  avatar: Bot,
                  color: '#89b4fa',
                  bgColor: 'rgba(137, 180, 250, 0.15)',
                  borderColor: '#89b4fa'
                };
                const recipientMeta = AGENT_META[turn.recipient] || (turn.recipient ? { name: turn.recipient } : null);
                const SenderIcon = senderMeta.avatar;
                const isObjection = turn.message.includes('OBJECTION') || turn.message.includes('rejected') || turn.message.includes('violation');
                const isApproved = turn.message.includes('APPROVED') || turn.message.includes('COMPLIANT');

                return (
                  <div
                    key={index}
                    className="bg-[#181825] rounded-xl p-3.5 border transition-all hover:border-[#45475a]"
                    style={{
                      borderLeftWidth: '4px',
                      borderLeftColor: senderMeta.color,
                      borderTopColor: '#313244',
                      borderRightColor: '#313244',
                      borderBottomColor: '#313244'
                    }}
                  >
                    {/* Speaker Header Bar */}
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: senderMeta.bgColor, color: senderMeta.color }}
                        >
                          <SenderIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#cdd6f4]">
                              {senderMeta.name}
                            </span>
                            {recipientMeta && (
                              <span className="flex items-center gap-1 text-[10px] text-[#6c7086]">
                                <ArrowRight className="w-3 h-3" />
                                <span className="text-[#a6adc8]">{recipientMeta.name}</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#a6adc8]">{senderMeta.role}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isObjection && (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#f38ba8]/20 text-[#f38ba8] border border-[#f38ba8]/30">
                            <AlertTriangle className="w-3 h-3" />
                            Adversarial Veto
                          </span>
                        )}
                        {isApproved && (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#a6e3a1]/20 text-[#a6e3a1] border border-[#a6e3a1]/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Audit Passed
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[#6c7086] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {turn.timestamp ? new Date(turn.timestamp).toLocaleTimeString() : `#${index + 1}`}
                        </span>
                      </div>
                    </div>

                    {/* Speech Bubble / Message Content */}
                    <div className="text-xs text-[#cdd6f4] leading-relaxed whitespace-pre-line pl-9">
                      {turn.message}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Running Activity Indicator */}
          {isRunning && (
            <div className="flex items-center gap-2 p-3 bg-[#181825] rounded-xl border border-[#89b4fa]/30 text-xs text-[#89b4fa] animate-pulse">
              <Bot className="w-4 h-4 animate-spin" />
              <span>Agents are currently deliberating and exchanging mathematical matrices...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
