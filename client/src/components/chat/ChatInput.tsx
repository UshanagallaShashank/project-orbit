// components/chat/ChatInput.tsx
// Textarea input at the bottom of the chat.
// Submit on Enter (Shift+Enter for newline). Disabled while sending.

import { useState, useRef } from 'react'
import { SendHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ChatStatus } from '@/types'

interface ChatInputProps {
  status: ChatStatus
  onSend: (text: string) => void
}

export function ChatInput({ status, onSend }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isSending = status === 'sending'

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const text = value.trim()
    if (!text || isSending) return
    onSend(text)
    setValue('')
    textareaRef.current?.focus()
  }

  return (
    <div className="flex items-end gap-2 border-t border-border p-4 bg-background">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message Orbit... (Enter to send)"
        disabled={isSending}
        className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5
                   text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1
                   focus:ring-ring disabled:opacity-50 min-h-[44px] max-h-[140px]"
        style={{ overflow: 'hidden' }}
        onInput={(e) => {
          const el = e.currentTarget
          el.style.height = 'auto'
          el.style.height = `${el.scrollHeight}px`
        }}
      />
      <Button
        size="icon"
        onClick={submit}
        disabled={!value.trim() || isSending}
        className="h-[44px] w-[44px] shrink-0"
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}
