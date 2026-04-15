// components/chat/ChatHistory.tsx
// Sidebar showing chat history with dates, snippets, and ability to load previous conversations

import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Clock, MessageSquare, X } from 'lucide-react'
import type { Message } from '@/types'

interface ChatHistoryProps {
  messages: Message[]
  onSelectConversation: (messages: Message[]) => void
  onClear: () => void
}

interface Conversation {
  id: string
  date: Date
  snippet: string
  messageCount: number
  lastMessage: Message
}

export function ChatHistory({ messages, onSelectConversation, onClear }: ChatHistoryProps) {
  // Group messages by date
  const conversations: Conversation[] = React.useMemo(() => {
    if (messages.length === 0) return []

    const grouped: Record<string, Message[]> = {}
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp)
      const key = date.toLocaleDateString()
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(msg)
    })

    return Object.entries(grouped)
      .map(([_, msgs]) => ({
        id: msgs[0].id,
        date: new Date(msgs[0].timestamp),
        snippet: msgs[msgs.length - 1].content.substring(0, 60),
        messageCount: msgs.length,
        lastMessage: msgs[msgs.length - 1],
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [messages])

  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No chat history yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Chat History</h3>
        <button
          onClick={onClear}
          className="p-1 hover:bg-muted rounded-md transition-colors"
          title="Clear history"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 p-3">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(messages.filter(m => new Date(m.timestamp).toLocaleDateString() === conv.date.toLocaleDateString()))}
            className="w-full text-left p-3 rounded-lg border border-border/50 bg-card hover:border-border hover:bg-muted/50 transition-all group"
          >
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
                  {conv.snippet}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(conv.date, { addSuffix: true })} • {conv.messageCount} messages
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
