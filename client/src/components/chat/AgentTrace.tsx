// components/chat/AgentTrace.tsx
// Visual indicator of which agents ran and what they extracted.
// Shown just above the AI reply to make the routing flow visible.

import { ArrowRight, Cpu } from 'lucide-react'
import type { Message, AgentName } from '@/types'
import { AgentBadge } from './AgentBadge'

interface AgentTraceProps {
  message: Message
}

// Rough token estimate: 1 token ~ 4 chars. Flash Lite costs ~$0.075 / 1M input tokens.
function estimateTokens(text: string): number {
  return Math.round(text.length / 4)
}

function agentSummary(message: Message, agent: AgentName): string | null {
  if (agent === 'task') {
    const n = message.tasks?.length ?? 0
    return n > 0 ? `${n} task${n > 1 ? 's' : ''} added` : null
  }
  if (agent === 'tracker') {
    const n = message.entries?.length ?? 0
    return n > 0 ? `${n} entr${n > 1 ? 'ies' : 'y'} logged` : null
  }
  if (agent === 'memory') {
    const n = message.memories?.length ?? 0
    return n > 0 ? `${n} saved` : null
  }
  if (agent === 'job') {
    const n = message.jobs?.length ?? 0
    return n > 0 ? `${n} job${n > 1 ? 's' : ''} found` : null
  }
  if (agent === 'resume') {
    const n = (message.skills?.length ?? 0) + (message.roles?.length ?? 0)
    return n > 0 ? `${message.skills?.length ?? 0} skills, ${message.roles?.length ?? 0} roles` : null
  }
  return null
}

export function AgentTrace({ message }: AgentTraceProps) {
  const agents: AgentName[] = (() => {
    if (message.agentsUsed && message.agentsUsed.length > 0) {
      return [...new Set(message.agentsUsed)]
    }
    if (message.agentUsed) return [message.agentUsed]
    return []
  })()

  if (agents.length === 0) return null

  const tokens = estimateTokens(message.content)

  return (
    <div className="flex items-start gap-2 px-1 text-xs text-muted-foreground/70">
      <Cpu className="h-3 w-3 mt-0.5 shrink-0 text-primary/50" />
      <div className="flex flex-wrap items-center gap-1 min-w-0">
        <span className="shrink-0">Handled by</span>
        {agents.map((agent, i) => {
          const summary = agentSummary(message, agent)
          return (
            <span key={agent} className="flex items-center gap-1">
              {i > 0 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40" />}
              <AgentBadge agent={agent} />
              {summary && (
                <span className="text-[10px] text-muted-foreground/60">({summary})</span>
              )}
            </span>
          )
        })}
        <span className="ml-1 text-[10px] text-muted-foreground/40">~{tokens} tokens</span>
      </div>
    </div>
  )
}
