// pages/ChatPage.tsx
// Core page: chat on the left, contextual data panel on the right.
// The right panel is conditionally shown based on what the last AI message returned.
// - task agent   -> TaskPanel
// - tracker agent -> TrackerPanel
// - memory agent  -> MemoryPanel
// - all three can appear simultaneously (data_agent extracts all at once)

import { useChatStore } from '@/stores/chatStore'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { ChatInput } from '@/components/chat/ChatInput'
import { TaskPanel } from '@/components/panels/TaskPanel'
import { TrackerPanel } from '@/components/panels/TrackerPanel'
import { MemoryPanel } from '@/components/panels/MemoryPanel'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SquarePen } from 'lucide-react'

export function ChatPage() {
  const { messages, status, error, sendMessage, clearHistory, clearError } = useChatStore()

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
  const hasPanelData = tasks.length > 0 || entries.length > 0 || memories.length > 0

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
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {status === 'sending' ? 'Sending…' : 'Ready'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="New chat"
                onClick={() => {
                  clearHistory()
                  toast.success('Started a new chat')
                }}
              >
                <SquarePen className="h-4 w-4" />
              </Button>
            </div>
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
