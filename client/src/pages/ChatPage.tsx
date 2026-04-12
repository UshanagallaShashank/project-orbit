// pages/ChatPage.tsx
// Core page: chat on the left, contextual data panel on the right.
// The right panel is conditionally shown based on what the last AI message returned.
// - task/tracker/memory agent -> respective panels
// - resume agent -> skills + roles panel
// - job agent    -> job listings panel
// - all can appear simultaneously (multi-agent routing)

import { useChatStore } from '@/stores/chatStore'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { ChatInput } from '@/components/chat/ChatInput'
import { TaskPanel } from '@/components/panels/TaskPanel'
import { TrackerPanel } from '@/components/panels/TrackerPanel'
import { MemoryPanel } from '@/components/panels/MemoryPanel'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ExternalLink, Briefcase, Code2 } from 'lucide-react'

export function ChatPage() {
  const { messages, status, error, sendMessage, clearError } = useChatStore()

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant')

  const tasks    = lastAssistant?.tasks    ?? []
  const entries  = lastAssistant?.entries  ?? []
  const memories = lastAssistant?.memories ?? []
  const jobs     = lastAssistant?.jobs     ?? []
  const skills   = lastAssistant?.skills   ?? []
  const roles    = lastAssistant?.roles    ?? []
  const hasPanelData = tasks.length > 0 || entries.length > 0 || memories.length > 0
    || jobs.length > 0 || skills.length > 0 || roles.length > 0

  const promptSuggestions = [
    'Add a task for tomorrow morning',
    'Log today’s workout and energy',
    'Remember that I prefer coffee over tea',
  ]

  // TopNav = h-16 (4rem). AppLayout padding = p-4 (1rem top + 1rem bottom).
  // Total to subtract: 4 + 1 + 1 = 6rem. At md: p-6 = 1.5 + 1.5 = 3rem -> 7rem.
  return (
    <div className="grid h-[calc(100svh-6rem)] md:h-[calc(100svh-7rem)] gap-4 overflow-hidden lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3 bg-background/90">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Chat with Orbit</p>
              <p className="text-xs text-muted-foreground">Send messages, log actions, and let Orbit extract tasks and habits.</p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              {status === 'sending' ? 'Sending…' : 'Ready'}
            </span>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChatWindow messages={messages} status={status} />
        </div>
        <div className="border-t border-border bg-background/90 p-4">
          <ChatInput status={status} onSend={sendMessage} />
        </div>
      </div>

      <aside className="flex min-w-0 flex-col gap-3 overflow-y-auto">
        {hasPanelData ? (
          <div className="space-y-3">
            <TaskPanel    tasks={tasks}       />
            <TrackerPanel entries={entries}   />
            <MemoryPanel  memories={memories} />

            {/* Resume skills panel */}
            {(skills.length > 0 || roles.length > 0) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Resume Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {skills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {skills.map((s) => (
                          <span key={s} className="text-xs bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {roles.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Target Roles</p>
                      <div className="flex flex-wrap gap-1">
                        {roles.map((r) => (
                          <span key={r} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Job listings panel */}
            {jobs.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Job Matches
                  </CardTitle>
                  <CardDescription>{jobs.length} listings found</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y divide-border">
                    {jobs.map((job, i) => (
                      <li key={i} className="flex items-start gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{job.title}</p>
                          {job.company && (
                            <p className="text-xs text-muted-foreground">{job.company}</p>
                          )}
                          {job.source && (
                            <span className="mt-1 inline-block text-xs bg-muted px-1.5 py-0.5 rounded-full">
                              {job.source}
                            </span>
                          )}
                          {job.snippet && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{job.snippet}</p>
                          )}
                        </div>
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Need a prompt?</CardTitle>
              <CardDescription>Try one of these starter prompts to get Orbit working for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 rounded-xl border border-border bg-background/80 p-4">
                {promptSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    disabled={status === 'sending'}
                    className="w-full rounded-2xl border border-border px-4 py-3 text-left text-sm text-foreground transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Orbit will extract tasks, tracker entries, and memories from your message automatically.
              </p>
            </CardContent>
          </Card>
        )}
      </aside>
    </div>
  )
}
