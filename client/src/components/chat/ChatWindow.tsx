// components/chat/ChatWindow.tsx
// Scrollable message list. Auto-scrolls to bottom on new messages.

import { useEffect, useRef } from 'react'
import { Sparkles, Briefcase, CheckSquare, Activity } from 'lucide-react'
import type { Message, ChatStatus } from '@/types'
import { MessageBubble } from './MessageBubble'
import { AgentTrace } from './AgentTrace'
import { TypingIndicator } from './TypingIndicator'

interface ChatWindowProps {
  messages: Message[]
  status: ChatStatus
}

const STARTER_IDEAS = [
  { icon: Briefcase, label: 'Find jobs for me', color: 'text-amber-500' },
  { icon: CheckSquare, label: 'Add a task for tomorrow', color: 'text-blue-500' },
  { icon: Activity, label: 'Log 2 hours of LeetCode', color: 'text-emerald-500' },
  { icon: Sparkles, label: 'What are my skills?', color: 'text-violet-500' },
]

export function ChatWindow({ messages, status }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  if (messages.length === 0) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg mx-auto space-y-6 text-center">
          {/* Orbit icon */}
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">What can I help you with?</p>
            <p className="text-sm text-muted-foreground">Jobs, resume, tasks, habits, income — just ask.</p>
          </div>
          {/* Quick-start chips */}
          <div className="grid grid-cols-2 gap-2">
            {STARTER_IDEAS.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-left text-sm text-foreground cursor-default select-none"
              >
                <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-1.5">
            {msg.role === 'assistant' && (
              <AgentTrace message={msg} />
            )}
            <MessageBubble message={msg} />
          </div>
        ))}
        {status === 'sending' && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
