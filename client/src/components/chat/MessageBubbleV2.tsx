// components/chat/MessageBubbleV2.tsx
// Message bubble - clean single-column layout, no clutter.

import { format } from 'date-fns'
import { ExternalLink, Star, Copy, Check, Eye, X } from 'lucide-react'
import Markdown from 'react-markdown'
import { useState } from 'react'
import type { Message, AgentName, Job } from '@/types'
import { AgentBadge } from './AgentBadge'

// -- DDG preview popup --------------------------------------------------------
function JobPreview({ job, onClose }: { job: Job; onClose: () => void }) {
  const query    = encodeURIComponent(`${job.title} ${job.company} job`)
  const thumbUrl = `https://image.thum.io/get/width/640/crop/420/noanimate/${encodeURIComponent(job.url || `https://duckduckgo.com/?q=${query}`)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-[640px] max-w-[95vw] rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700 bg-slate-800">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{job.title}</p>
            {job.company && <p className="text-[10px] text-slate-400">@ {job.company}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {job.url && (
              <a href={job.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/20 transition-colors">
                Open <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
            <button onClick={onClose} className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Screenshot via thum.io */}
        <div className="h-[420px] bg-slate-800 flex items-center justify-center overflow-hidden">
          <img
            src={thumbUrl}
            alt={`Preview of ${job.title}`}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
              const parent = (e.target as HTMLImageElement).parentElement
              if (parent) parent.innerHTML = '<p class="text-xs text-slate-500 text-center px-6">Preview unavailable — open the link directly</p>'
            }}
          />
        </div>
      </div>
    </div>
  )
}

interface MessageBubbleV2Props {
  message: Message
}

export function MessageBubbleV2({ message }: MessageBubbleV2Props) {
  const isUser = message.role === 'user'
  const [copied, setCopied]       = useState(false)
  const [previewJob, setPreviewJob] = useState<Job | null>(null)

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
          <div className="w-full rounded-xl border border-slate-700/60 bg-slate-800/60 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/40">
              <Star className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <p className="text-xs font-semibold text-slate-300">
                {message.jobs.length} Job {message.jobs.length === 1 ? 'Match' : 'Matches'}
              </p>
              <span className="ml-auto text-[10px] text-slate-500">Links may expire — verify on the source site</span>
            </div>
            <div className="divide-y divide-slate-700/40">
              {message.jobs.map((job, i) => {
                const score = job.match_score ?? 0
                const scoreColor = score >= 8
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : score >= 5
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-slate-600/40 text-slate-400'
                return (
                  <div key={i} className="px-3 py-2.5 hover:bg-slate-700/30 transition-colors">
                    {/* Row 1: title + score */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="text-sm font-semibold text-slate-100 leading-tight">{job.title}</span>
                        {job.source && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0
                            ${job.source === 'LinkedIn'    ? 'bg-blue-500/20 text-blue-300'
                            : job.source === 'Naukri'      ? 'bg-orange-500/20 text-orange-300'
                            : job.source === 'Indeed'      ? 'bg-violet-500/20 text-violet-300'
                            : job.source === 'Glassdoor'   ? 'bg-green-500/20 text-green-300'
                            : job.source === 'Wellfound'   ? 'bg-pink-500/20 text-pink-300'
                            : job.source === 'Internshala' ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-slate-500/20 text-slate-300'}`}>
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
                    {job.company && <p className="text-[11px] text-slate-400 mt-0.5">@ {job.company}</p>}
                    {job.snippet && <p className="text-xs text-slate-400/80 mt-1 line-clamp-2">{job.snippet}</p>}

                    {/* Row 3: gap tags + preview + search */}
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {job.missing_skills && job.missing_skills.length > 0 && (
                          <>
                            <span className="text-[10px] text-slate-500">Gap:</span>
                            {job.missing_skills.slice(0, 3).map((s: string) => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                                {s}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Eye icon — shows screenshot preview */}
                        <button
                          onClick={() => setPreviewJob(job)}
                          className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
                          title="Preview"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        {/* Search link */}
                        {(() => {
                          const searchQuery = encodeURIComponent(`${job.title} ${job.company} job`)
                          const href = job.url || `https://www.linkedin.com/jobs/search/?keywords=${searchQuery}`
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                              Search <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                )
              })}
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

      {/* Job preview modal */}
      {previewJob && <JobPreview job={previewJob} onClose={() => setPreviewJob(null)} />}
    </div>
  )
}
