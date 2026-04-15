// components/chat/ChatWindow.tsx
// Scrollable message list. Empty state shows quick-action prompts.

import { useEffect, useRef } from 'react'
import { Target, Zap, TrendingUp, Lightbulb } from 'lucide-react'
import type { Message, ChatStatus } from '@/types'
import { MessageBubbleV2 } from './MessageBubbleV2'
import { TypingIndicator } from './TypingIndicator'

interface ChatWindowProps {
  messages: Message[]
  status: ChatStatus
}

const STARTER_PROMPTS = [
  { icon: Target,      label: 'Find jobs matching my resume' },
  { icon: Zap,         label: 'Improve my resume'            },
  { icon: TrendingUp,  label: 'Log my coding session'        },
  { icon: Lightbulb,   label: 'What skills do I have?'       },
]

export function ChatWindow({ messages, status }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-8 gap-6">
        {/* Logo + title */}
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
            <span className="text-lg font-black text-white">O</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Orbit Command Center</h2>
          <p className="mt-1 text-sm text-slate-500">Your personal AI OS — jobs, resume, tasks, habits</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2 w-full max-w-md">
          {STARTER_PROMPTS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-2.5 text-left text-sm text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-100 transition-all"
            >
              <Icon className="h-4 w-4 shrink-0 text-slate-400" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-600">
          Tip: you can ask multiple agents in one message
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubbleV2 key={msg.id} message={msg} />
        ))}
        {status === 'sending' && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
