// components/chat/AgentFlowVisualization.tsx
// Visual DAG showing agent routing and what agent handled the request
// Shows agent name, status, token usage, and response time

import { Zap, CheckCircle2, AlertCircle, Clock, Cpu } from 'lucide-react'
import type { AgentMetadata } from '@/types'

const AGENT_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  task: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', icon: '✓' },
  tracker: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', icon: '📊' },
  memory: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300', icon: '💾' },
  mentor: { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-300', icon: '🎯' },
  job: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', icon: '💼' },
  resume: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-300', icon: '📄' },
  income: { bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200 dark:border-teal-800', text: 'text-teal-700 dark:text-teal-300', icon: '💰' },
  orchestrator: { bg: 'bg-slate-50 dark:bg-slate-950/30', border: 'border-slate-200 dark:border-slate-800', text: 'text-slate-700 dark:text-slate-300', icon: '🎛️' },
  general: { bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200 dark:border-cyan-800', text: 'text-cyan-700 dark:text-cyan-300', icon: '⚡' },
}

interface AgentFlowVisualizationProps {
  agents: AgentMetadata[]
}

export function AgentFlowVisualization({ agents }: AgentFlowVisualizationProps) {
  if (!agents || agents.length === 0) return null

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      case 'error':
        return <AlertCircle className="h-3.5 w-3.5 text-red-500" />
      case 'processing':
        return <Zap className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
      default:
        return <Clock className="h-3.5 w-3.5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-3 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <Zap className="h-3.5 w-3.5 text-violet-500" />
        <span className="text-xs font-semibold text-foreground">Agent Flow</span>
        <span className="ml-auto text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
          {agents.length} {agents.length === 1 ? 'agent' : 'agents'}
        </span>
      </div>

      {/* Agent cards flow */}
      <div className="space-y-2">
        {agents.map((agent, idx) => {
          const colors = AGENT_COLORS[agent.name] || AGENT_COLORS.general
          
          return (
            <div key={agent.name} className="flex items-center gap-2">
              {/* Agent node */}
              <div className={`flex-1 rounded-lg border-2 ${colors.border} ${colors.bg} p-2.5 px-3`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{colors.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold ${colors.text} truncate`}>
                        {agent.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {agent.status === 'complete' && 'Completed'}
                        {agent.status === 'processing' && 'Processing...'}
                        {agent.status === 'error' && 'Error'}
                        {!agent.status && 'Ready'}
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-2 shrink-0">
                    {agent.tokensUsed !== undefined && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <Cpu className="h-3 w-3" />
                          <span className="text-emphasis">{agent.tokensUsed}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">tokens</p>
                      </div>
                    )}
                    {agent.responseTime !== undefined && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="text-emphasis">{agent.responseTime}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">ms</p>
                      </div>
                    )}
                    {getStatusIcon(agent.status)}
                  </div>
                </div>
              </div>

              {/* Connector arrow */}
              {idx < agents.length - 1 && (
                <div className="flex flex-col items-center gap-1">
                  <div className="h-4 w-0.5 bg-gradient-to-b from-violet-400/50 to-transparent" />
                  <span className="text-xs text-muted-foreground">→</span>
                  <div className="h-4 w-0.5 bg-gradient-to-b from-transparent to-violet-400/50" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
