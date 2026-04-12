// components/chat/MessageBubble.tsx
// Renders a single chat message with role styling and agent badge.

import { format } from 'date-fns'
import type { Message } from '@/types'
import { AgentBadge } from './AgentBadge'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex min-w-0 w-full gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="mt-1 shrink-0">
        <div
          className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium
            ${isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
            }`}
        >
          {isUser ? 'Y' : 'AI'}
        </div>
      </div>

      <div className={`flex min-w-0 w-full flex-col gap-1 max-w-full sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && message.agentUsed && (
          <AgentBadge agent={message.agentUsed} />
        )}
        <div
          className={`w-full max-w-full rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words break-all overflow-hidden
            ${isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted text-foreground rounded-tl-sm'
            }`}
        >
          {message.content}
        </div>
        <span className="text-xs text-muted-foreground">
          {format(message.timestamp, 'h:mm a')}
        </span>
      </div>
    </div>
  )
}
