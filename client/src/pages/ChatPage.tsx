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
import { Code2, AlertTriangle, RotateCcw, Download, Mail, Loader2 } from 'lucide-react'
import { resumeApi } from '@/api/resume'
import { useState } from 'react'

export function ChatPage() {
  const { messages, status, error, lastFailedMessage, sendMessage, retryLastMessage, clearError } = useChatStore()
  const [pdfLoading,   setPdfLoading]   = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  async function handleDownloadPdf() {
    setPdfLoading(true)
    try {
      const res = await resumeApi.downloadPdf()
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a   = document.createElement('a')
      a.href    = url
      a.download = 'resume.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('PDF generation failed — upload your resume first')
    } finally {
      setPdfLoading(false)
    }
  }

  async function handleEmailPdf() {
    setEmailLoading(true)
    try {
      const res = await resumeApi.emailPdf()
      toast.success(`Resume sent to ${res.data.to}`)
    } catch {
      toast.error('Email failed — check RESEND_API_KEY in server/.env')
    } finally {
      setEmailLoading(false)
    }
  }

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

        {/* Error / retry banner */}
        {status === 'error' && lastFailedMessage && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-950/40 border-b border-red-500/20 text-xs text-red-300 shrink-0">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />
            <span className="flex-1 truncate">Failed to send: "{lastFailedMessage}"</span>
            <button
              onClick={retryLastMessage}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/15 hover:bg-red-500/25 text-red-300 font-medium transition-colors shrink-0"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
            <button onClick={clearError} className="text-red-400/60 hover:text-red-300 px-1">
              x
            </button>
          </div>
        )}

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
                {/* PDF download + email buttons */}
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading}
                    className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20 disabled:opacity-50 transition-colors"
                  >
                    {pdfLoading ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Download className="h-2.5 w-2.5" />}
                    PDF
                  </button>
                  <button
                    onClick={handleEmailPdf}
                    disabled={emailLoading}
                    className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20 disabled:opacity-50 transition-colors"
                  >
                    {emailLoading ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Mail className="h-2.5 w-2.5" />}
                    Email
                  </button>
                </div>
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
