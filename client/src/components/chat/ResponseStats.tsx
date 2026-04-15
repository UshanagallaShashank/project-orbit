// components/chat/ResponseStats.tsx
// Shows token usage, response time, and estimated costs for transparent AI usage

import React from 'react'
import { Sparkles, Zap, Clock, DollarSign } from 'lucide-react'
import type { ResponseMetadata } from '@/types'

interface ResponseStatsProps {
  metadata?: ResponseMetadata
  collapsed?: boolean
}

export function ResponseStats({ metadata, collapsed = true }: ResponseStatsProps) {
  if (!metadata) return null

  const [isExpanded, setIsExpanded] = React.useState(!collapsed)

  const formatTime = (ms?: number) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatCost = (cost?: number) => {
    if (!cost) return 'N/A'
    if (cost < 0.0001) return '<$0.0001'
    return `$${cost.toFixed(4)}`
  }

  const stats = [
    {
      icon: <Zap className="h-3.5 w-3.5" />,
      label: 'Tokens',
      value: metadata.totalTokensUsed ?? 0,
      unit: 'tokens',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: <Clock className="h-3.5 w-3.5" />,
      label: 'Time',
      value: formatTime(metadata.totalResponseTime),
      unit: '',
      color: 'text-amber-600 dark:text-amber-400'
    },
    {
      icon: <DollarSign className="h-3.5 w-3.5" />,
      label: 'Cost',
      value: formatCost(metadata.costEstimate),
      unit: '',
      color: 'text-emerald-600 dark:text-emerald-400'
    }
  ]

  return (
    <div className="rounded-lg border border-border/40 bg-gradient-to-r from-violet-50/40 via-purple-50/40 to-pink-50/40 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-pink-950/20 overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5 text-violet-500" />
        <span className="text-xs font-medium text-foreground">Response Details</span>
        <div className="ml-auto text-xs text-muted-foreground">{isExpanded ? '−' : '+'}</div>
      </button>

      {/* Expandable stats */}
      {isExpanded && (
        <>
          <div className="h-px bg-border/40" />
          <div className="px-3 py-2.5 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="rounded-md border border-border/40 bg-background/50 p-2 text-center hover:border-border transition-colors"
                >
                  <div className={`flex items-center justify-center gap-1 ${stat.color} mb-1`}>
                    {stat.icon}
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {typeof stat.value === 'number' 
                      ? stat.value.toLocaleString() 
                      : stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Agents involved */}
            {metadata.agentsInvolved && metadata.agentsInvolved.length > 0 && (
              <div className="pt-2 border-t border-border/40">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Agents:</p>
                <div className="flex flex-wrap gap-1">
                  {metadata.agentsInvolved.map((agent) => (
                    <span
                      key={agent.name}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/50 hover:bg-muted/80 transition-colors"
                    >
                      <span>{agent.displayName}</span>
                      {agent.tokensUsed && (
                        <span className="text-muted-foreground/70">{agent.tokensUsed}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cost optimization note */}
            {metadata.costEstimate && metadata.costEstimate < 0.0001 && (
              <div className="mt-2 p-2 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50">
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  ✓ Optimal performance — budget-friendly
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
