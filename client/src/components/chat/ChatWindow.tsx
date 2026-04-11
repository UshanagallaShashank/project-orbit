// components/chat/ChatWindow.tsx
// Scrollable message list. Auto-scrolls to bottom on new messages.

import { useEffect, useRef } from 'react'
import type { Message, ChatStatus } from '@/types'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'

interface ChatWindowProps {
  messages: Message[]
  status: ChatStatus
}

export function ChatWindow({ messages, status }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        <div className="text-center space-y-2">
          <p className="text-base font-medium">What can I help you with?</p>
          <p className="text-xs">Log tasks, track habits, save notes, get mentorship.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {status === 'sending' && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  )
}
