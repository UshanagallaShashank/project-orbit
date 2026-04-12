// components/chat/MessageBubble.tsx
// Renders a single chat message with role styling and agent badge(s).

import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import type { Message, AgentName } from '@/types'
import { AgentBadge } from './AgentBadge'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  // Deduplicated list of agents to show badges for
  const badgeAgents: AgentName[] = (() => {
    if (message.agentsUsed && message.agentsUsed.length > 0) {
      return [...new Set(message.agentsUsed)]
    }
    if (message.agentUsed) return [message.agentUsed]
    return []
  })()

  return (
    <div className={`flex min-w-0 w-full gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="mt-1 shrink-0">
        <div
          className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium
            ${isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
            }`}
        >
          {isUser ? 'Y' : 'AI'}
        </div>
      </div>

      <div className={`flex min-w-0 w-full flex-col gap-1 max-w-full sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && badgeAgents.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {badgeAgents.map((agent) => (
              <AgentBadge key={agent} agent={agent} />
            ))}
          </div>
        )}
        <div
          className={`w-full max-w-full rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words break-all overflow-hidden
            ${isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted text-foreground rounded-tl-sm'
            }`}
        >
          {message.content}
        </div>

        {/* Job results panel */}
        {!isUser && message.jobs && message.jobs.length > 0 && (
          <div className="w-full max-w-full mt-1 rounded-xl border border-border bg-background overflow-hidden">
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
              Job matches
            </p>
            <ul className="divide-y divide-border">
              {message.jobs.map((job, i) => (
                <li key={i} className="flex items-start gap-3 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium truncate">{job.title}</span>
                      {job.company && (
                        <span className="text-xs text-muted-foreground">at {job.company}</span>
                      )}
                      {job.source && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{job.source}</span>
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
                      className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <span className="text-xs text-muted-foreground">
          {format(message.timestamp, 'h:mm a')}
        </span>
      </div>
    </div>
  )
}
