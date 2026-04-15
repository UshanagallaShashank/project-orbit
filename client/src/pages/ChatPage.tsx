// pages/ChatPage.tsx
// Two-column when there is panel data, single-column otherwise.
// Right panel only renders when there is actually something to show.

import { useChatStore } from '@/stores/chatStore'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { ChatInput } from '@/components/chat/ChatInput'
import { TaskPanel } from '@/components/panels/TaskPanel'
import { TrackerPanel } from '@/components/panels/TrackerPanel'
import { MemoryPanel } from '@/components/panels/MemoryPanel'
import { AgentHexagonGraph } from '@/components/chat/AgentHexagonGraph'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Code2 } from 'lucide-react'

export function ChatPage() {
  const { messages, status, error, sendMessage, clearError } = useChatStore()

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')

  const tasks          = lastAssistant?.tasks    ?? []
  const entries        = lastAssistant?.entries  ?? []
  const memories       = lastAssistant?.memories ?? []
  const jobs           = lastAssistant?.jobs     ?? []
  const skills         = lastAssistant?.skills   ?? []
  const roles          = lastAssistant?.roles    ?? []
  const agentsInvolved = lastAssistant?.metadata?.agentsInvolved ?? []

  const hasPanelData = tasks.length > 0 || entries.length > 0 || memories.length > 0
    || jobs.length > 0 || skills.length > 0 || roles.length > 0 || agentsInvolved.length > 0

  return (
    <div className={`grid h-full gap-3 overflow-hidden p-3
      ${hasPanelData
        ? 'md:grid-cols-[minmax(0,1fr)_18rem] grid-cols-[minmax(0,1fr)]'
        : 'grid-cols-[minmax(0,1fr)]'
      }`}
    >
      {/* Main chat column */}
      <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900">

        {/* Header - single compact row */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">O</span>
            </div>
            <span className="text-sm font-semibold text-slate-200">Orbit</span>
            <span className="text-xs text-slate-500">/ Command Center</span>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md ${
            status === 'sending'
              ? 'bg-blue-500/15 text-blue-400'
              : 'bg-emerald-500/10 text-emerald-400'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              status === 'sending' ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400'
            }`} />
            {status === 'sending' ? 'Thinking...' : 'Ready'}
          </div>
        </div>

        {/* Messages */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChatWindow messages={messages} status={status} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 shrink-0 border-t border-slate-700/40">
          <ChatInput status={status} onSend={sendMessage} />
        </div>
      </div>

      {/* Right panel - only rendered when there is data */}
      {hasPanelData && (
        <aside className="hidden md:flex flex-col gap-3 min-w-0 overflow-y-auto">
          {agentsInvolved.length > 0 && <AgentHexagonGraph agents={agentsInvolved} />}
          {tasks.length > 0 && <TaskPanel tasks={tasks} />}
          {entries.length > 0 && <TrackerPanel entries={entries} />}
          {memories.length > 0 && <MemoryPanel memories={memories} />}
          {(skills.length > 0 || roles.length > 0) && (
            <Card className="border-slate-700/60 bg-slate-800/60 shadow-none">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-slate-300">
                  <Code2 className="h-3.5 w-3.5 text-indigo-400" />
                  Resume Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                {skills.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 mb-1.5">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {skills.map((s) => (
                        <span key={s} className="text-[11px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {roles.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 mb-1.5">Target Roles</p>
                    <div className="flex flex-wrap gap-1">
                      {roles.map((r) => (
                        <span key={r} className="text-[11px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </aside>
      )}
    </div>
  )
}
