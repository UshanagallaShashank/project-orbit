// components/chat/MessageBubble.tsx
// Renders a single chat message with role styling, agent badges, markdown, and response stats.

import { format } from 'date-fns'
import { ExternalLink, Briefcase } from 'lucide-react'
import Markdown from 'react-markdown'
import type { Message, AgentName } from '@/types'
import { AgentBadge } from './AgentBadge'
import { ResponseStats } from './ResponseStats'
import { AgentGraphVisualization } from './AgentGraphVisualization'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  const badgeAgents: AgentName[] = (() => {
    if (message.agentsUsed && message.agentsUsed.length > 0) {
      return [...new Set(message.agentsUsed)]
    }
    if (message.agentUsed) return [message.agentUsed]
    return []
  })()

  return (
    <div className={`flex min-w-0 w-full gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar */}
      <div className="mt-1 shrink-0">
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-sm
            ${isUser
              ? 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground'
              : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
            }`}
        >
          {isUser ? 'U' : 'AI'}
        </div>
      </div>

      <div className={`flex min-w-0 w-full flex-col gap-2 max-w-full sm:max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>

        {/* Agent flow visualization */}
        {!isUser && message.metadata?.agentsInvolved && message.metadata.agentsInvolved.length > 0 && (
          <AgentGraphVisualization agents={message.metadata.agentsInvolved} />
        )}

        {/* Agent badges */}
        {!isUser && badgeAgents.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {badgeAgents.map((agent) => (
              <AgentBadge key={agent} agent={agent} />
            ))}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`w-full max-w-full rounded-2xl px-4 py-3 text-sm leading-relaxed
            ${isUser
              ? 'bg-gradient-to-br from-primary to-primary/85 text-primary-foreground rounded-tr-sm shadow-md shadow-primary/20'
              : 'bg-card border border-border text-foreground rounded-tl-sm shadow-sm'
            }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:font-semibold prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-muted prose-pre:rounded-lg">
              <Markdown>{message.content}</Markdown>
            </div>
          )}
        </div>

        {/* Response stats */}
        {!isUser && message.metadata && (
          <ResponseStats metadata={message.metadata} collapsed={true} />
        )}

        {/* Job results — inline cards */}
        {!isUser && message.jobs && message.jobs.length > 0 && (
          <div className="w-full max-w-full mt-1 rounded-xl border border-border bg-background/80 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/40">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">
                {message.jobs.length} job {message.jobs.length === 1 ? 'match' : 'matches'}
              </span>
            </div>

            {/* Cards */}
            <ul className="divide-y divide-border">
              {message.jobs.map((job, i) => {
                const score = job.match_score ?? 0
                const scoreColor =
                  score >= 8 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : score >= 5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  : 'bg-muted text-muted-foreground'

                return (
                  <li key={i} className="px-3 py-2.5 hover:bg-muted/40 transition-colors">
                    {/* Row 1: title + score + source */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="text-sm font-semibold leading-tight">{job.title}</span>
                        {job.company && (
                          <span className="text-xs text-muted-foreground shrink-0">@ {job.company}</span>
                        )}
                        {job.source && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0
                            ${job.source === 'LinkedIn' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            : job.source === 'Naukri' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                            : 'bg-muted text-muted-foreground'}`}>
                            {job.source}
                          </span>
                        )}
                      </div>
                      {score > 0 && (
                        <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${scoreColor}`}>
                          {score}/10
                        </span>
                      )}
                    </div>

                    {/* Row 2: snippet */}
                    {job.snippet && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{job.snippet}</p>
                    )}

                    {/* Row 3: missing skills + apply button */}
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {job.missing_skills && job.missing_skills.length > 0 && (
                          <>
                            <span className="text-[10px] text-muted-foreground">Gap:</span>
                            {job.missing_skills.slice(0, 3).map((s: string) => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                {s}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          Apply
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <span className="text-[11px] text-muted-foreground/60">
          {format(message.timestamp, 'h:mm a')}
        </span>
      </div>
    </div>
  )
}
