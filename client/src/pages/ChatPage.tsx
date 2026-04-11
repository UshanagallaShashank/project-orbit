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

export function ChatPage() {
  const { messages, status, error, sendMessage, clearError } = useChatStore()

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  // Find the last assistant message that has any extracted data
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant')

  const tasks    = lastAssistant?.tasks    ?? []
  const entries  = lastAssistant?.entries  ?? []
  const memories = lastAssistant?.memories ?? []
  const hasPanelData = tasks.length > 0 || entries.length > 0 || memories.length > 0

  return (
    <div className="flex h-[calc(100vh-3.5rem)] gap-4">
      {/* Chat column */}
      <div className="flex flex-col flex-1 min-w-0 rounded-xl border border-border overflow-hidden bg-background">
        <ChatWindow messages={messages} status={status} />
        <ChatInput status={status} onSend={sendMessage} />
      </div>

      {/* Context panel - only rendered when there is data to show */}
      {hasPanelData && (
        <div className="hidden lg:flex flex-col w-72 shrink-0 gap-3 overflow-y-auto pb-4">
          <TaskPanel    tasks={tasks}       />
          <TrackerPanel entries={entries}   />
          <MemoryPanel  memories={memories} />
        </div>
      )}
    </div>
  )
}
