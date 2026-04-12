// components/chat/ChatInput.tsx
// Textarea + send button + file attachment.
// Attach: reads the file as text and appends it to the textarea so the user
// can review/edit before sending (no silent background uploads).
// Supported: .txt, .md, .pdf (text layer only via FileReader), .docx is noted
// as not parseable client-side - user gets a hint.

import { useState, useRef } from 'react'
import { SendHorizontal, Paperclip, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { ChatStatus } from '@/types'

interface ChatInputProps {
  status: ChatStatus
  onSend: (text: string) => void
}

const ACCEPTED = '.txt,.md,.csv,.json,.py,.js,.ts,.tsx,.jsx'

export function ChatInput({ status, onSend }: ChatInputProps) {
  const [value, setValue]         = useState('')
  const [fileName, setFileName]   = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef     = useRef<HTMLInputElement>(null)
  const isSending   = status === 'sending'

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
    setFileName(null)
    autoResize(null)
    textareaRef.current?.focus()
  }

  function autoResize(el: HTMLTextAreaElement | null) {
    const target = el ?? textareaRef.current
    if (!target) return
    target.style.height = 'auto'
    target.style.height = `${target.scrollHeight}px`
  }

  function clearFile() {
    setFileName(null)
    // Remove the [File: ...] block from the textarea if present
    setValue((prev) => prev.replace(/\n?\[File:[^\]]+\]\n[\s\S]*/, '').trimEnd())
    if (fileRef.current) fileRef.current.value = ''
    autoResize(null)
    textareaRef.current?.focus()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 100_000) {
      toast.error('File too large — max 100 KB for inline pasting')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = (ev.target?.result as string) ?? ''
      setFileName(file.name)
      setValue((prev) => {
        const base = prev.trimEnd()
        const block = `\n[File: ${file.name}]\n${content}`
        return base ? base + block : block.trimStart()
      })
      setTimeout(() => autoResize(null), 0)
      textareaRef.current?.focus()
    }
    reader.onerror = () => toast.error('Could not read file')
    reader.readAsText(file)

    // Reset so same file can be re-selected
    e.target.value = ''
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {/* File pill */}
      {fileName && (
        <div className="flex items-center gap-1.5 self-start rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground">
          <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="max-w-[180px] truncate">{fileName}</span>
          <button
            type="button"
            onClick={clearFile}
            className="ml-0.5 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Attach button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-[44px] w-[44px] shrink-0 text-muted-foreground hover:text-foreground"
          title="Attach file"
          disabled={isSending}
          onClick={() => fileRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => { setValue(e.target.value); autoResize(e.currentTarget) }}
          onKeyDown={handleKeyDown}
          placeholder="Message Orbit… (Enter to send, Shift+Enter for newline)"
          disabled={isSending}
          className="flex-1 min-w-0 resize-none rounded-xl border border-input bg-background px-4 py-2.5
                     text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1
                     focus:ring-ring disabled:opacity-50 min-h-[44px] max-h-[160px] overflow-y-auto"
        />

        <Button
          size="icon"
          onClick={submit}
          disabled={!value.trim() || isSending}
          className="h-[44px] w-[44px] flex-none"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
