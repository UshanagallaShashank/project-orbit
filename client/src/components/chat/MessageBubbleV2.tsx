// components/chat/MessageBubbleV2.tsx
// Message bubble - clean single-column layout, no clutter.

import { format } from 'date-fns'
import { ExternalLink, Star, Copy, Check } from 'lucide-react'
import Markdown from 'react-markdown'
import { useState } from 'react'
import type { Message, AgentName } from '@/types'
import { AgentBadge } from './AgentBadge'

interface MessageBubbleV2Props {
  message: Message
}

export function MessageBubbleV2({ message }: MessageBubbleV2Props) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  // Only show badges when a specialized agent (not just "general") ran.
  const badgeAgents: AgentName[] = (() => {
    const agents = message.agentsUsed && message.agentsUsed.length > 0
      ? [...new Set(message.agentsUsed)]
      : message.agentUsed ? [message.agentUsed] : []
    return agents.filter((a) => a !== 'general')
  })()

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const responseTime = message.metadata?.totalResponseTime
    ? `${(message.metadata.totalResponseTime / 1000).toFixed(1)}s`
    : null

  return (
    <div className={`flex w-full gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div className="mt-1 shrink-0">
        {isUser ? (
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
            U
          </div>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
            AI
          </div>
        )}
      </div>

      <div className={`flex flex-col gap-1.5 max-w-2xl w-full ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Agent badges - only when specialized agents ran */}
        {!isUser && badgeAgents.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {badgeAgents.map((agent) => (
              <AgentBadge key={agent} agent={agent} />
            ))}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`relative group/bubble rounded-2xl
            ${isUser
              ? 'bg-blue-600 text-white rounded-br-sm max-w-lg px-4 py-3'
              : 'bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700 px-4 py-3'
            }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.content}
            </p>
          ) : message.content ? (
            <div className="prose prose-sm dark:prose-invert max-w-none
              prose-p:text-slate-200 prose-p:leading-relaxed prose-p:my-1.5
              prose-headings:text-slate-100 prose-headings:mt-3 prose-headings:mb-1.5
              prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0 prose-li:text-slate-200
              prose-strong:text-white
              prose-code:bg-slate-700 prose-code:text-cyan-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
              prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline">
              <Markdown>{message.content}</Markdown>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Processing complete.</p>
          )}

          {/* Copy button - appears on hover */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute -top-2.5 -right-2.5 opacity-0 group-hover/bubble:opacity-100 transition-opacity p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white shadow"
              title="Copy"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        {/* Job results */}
        {!isUser && message.jobs && message.jobs.length > 0 && (
          <div className="w-full rounded-xl border border-amber-500/30 bg-amber-950/30 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-500/20">
              <Star className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <p className="text-xs font-semibold text-amber-300">
                {message.jobs.length} Job {message.jobs.length === 1 ? 'Match' : 'Matches'}
              </p>
            </div>
            <div className="divide-y divide-amber-500/10">
              {message.jobs.map((job, i) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2.5 hover:bg-amber-950/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-amber-100">{job.title}</span>
                      {job.source && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                          ${job.source === 'LinkedIn' ? 'bg-blue-500/20 text-blue-300'
                          : job.source === 'Naukri' ? 'bg-orange-500/20 text-orange-300'
                          : 'bg-slate-500/20 text-slate-300'}`}>
                          {job.source}
                        </span>
                      )}
                    </div>
                    {job.company && <p className="text-xs text-amber-200/50 mt-0.5">@ {job.company}</p>}
                    {job.snippet && <p className="text-xs text-amber-100/60 mt-0.5 line-clamp-2">{job.snippet}</p>}
                  </div>
                  {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 p-1.5 rounded text-amber-400 hover:bg-amber-500/20 transition-colors">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer: timestamp + response time */}
        <div className={`flex items-center gap-2 px-0.5 text-xs ${isUser ? 'text-blue-300/50' : 'text-slate-600'}`}>
          <span>{format(message.timestamp, 'h:mm a')}</span>
          {responseTime && (
            <>
              <span>·</span>
              <span>{responseTime}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
