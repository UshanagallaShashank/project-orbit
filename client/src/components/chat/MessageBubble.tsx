// components/chat/MessageBubble.tsx
// Renders a single chat message with role styling, agent badges, markdown, and response stats.

import { format } from 'date-fns'
import { ExternalLink, Star } from 'lucide-react'
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
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-amber-50 dark:bg-amber-900/10">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {message.jobs.length} job {message.jobs.length === 1 ? 'match' : 'matches'}
              </p>
            </div>
            <ul className="divide-y divide-border">
              {message.jobs.map((job, i) => (
                <li key={i} className="flex items-start gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium">{job.title}</span>
                      {job.company && (
                        <span className="text-xs text-muted-foreground">at {job.company}</span>
                      )}
                      {job.source && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                          ${job.source === 'LinkedIn' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : job.source === 'Naukri' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                          : 'bg-muted text-muted-foreground'}`}>
                          {job.source}
                        </span>
                      )}
                    </div>
                    {job.snippet && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{job.snippet}</p>
                    )}
                  </div>
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 mt-0.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </li>
              ))}
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
