// components/chat/ChatInput.tsx
// Textarea + send button + file attachment.
//
// Two attachment modes based on file type:
//   Text files (.txt, .md, .csv, .json, .py, .ts, etc.)
//     -> read inline via FileReader, paste content into textarea
//   Binary files (.pdf, .docx, .png, .jpg, etc.)
//     -> upload to /api/upload (server extracts text), then inject
//        "[Attached: filename]" reference so the AI can reference it

import { useState, useRef } from 'react'
import { SendHorizontal, Paperclip, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { uploadApi } from '@/api/upload'
import type { ChatStatus } from '@/types'

interface ChatInputProps {
  status: ChatStatus
  onSend: (text: string) => void
}

const TEXT_EXTS  = ['.txt', '.md', '.csv', '.json', '.py', '.js', '.ts', '.tsx', '.jsx']
const BINARY_EXTS = ['.pdf', '.docx', '.png', '.jpg', '.jpeg', '.webp', '.gif']
const ALL_ACCEPTED = [...TEXT_EXTS, ...BINARY_EXTS].join(',')
const MAX_TEXT_BYTES = 100_000

function isTextFile(name: string) {
  const lower = name.toLowerCase()
  return TEXT_EXTS.some((ext) => lower.endsWith(ext))
}

export function ChatInput({ status, onSend }: ChatInputProps) {
  const [value, setValue]           = useState('')
  const [fileName, setFileName]     = useState<string | null>(null)
  const [uploading, setUploading]   = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef     = useRef<HTMLInputElement>(null)
  const isSending   = status === 'sending'
  const isDisabled  = isSending || uploading

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const text = value.trim()
    if (!text || isDisabled) return
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
    setValue((prev) => prev.replace(/\n?\[(?:File|Attached):[^\]]+\][\s\S]*?(?=\n\[|$)/, '').trimEnd())
    if (fileRef.current) fileRef.current.value = ''
    autoResize(null)
    textareaRef.current?.focus()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (isTextFile(file.name)) {
      // Inline paste for text files
      if (file.size > MAX_TEXT_BYTES) {
        toast.error('File too large — max 100 KB for text files')
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
    } else {
      // Upload binary files (PDF, DOCX, images) to the server
      setUploading(true)
      try {
        await uploadApi.upload(file)
        setFileName(file.name)
        setValue((prev) => {
          const base = prev.trimEnd()
          const ref = `\n[Attached: ${file.name}]`
          return base ? base + ref : ref.trimStart()
        })
        toast.success(`${file.name} uploaded — Orbit can now reference it`)
        setTimeout(() => autoResize(null), 0)
        textareaRef.current?.focus()
      } catch {
        toast.error('Upload failed — check server is running')
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {/* File pill */}
      {(fileName || uploading) && (
        <div className="flex items-center gap-1.5 self-start rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground">
          {uploading
            ? <Loader2 className="h-3 w-3 shrink-0 animate-spin text-muted-foreground" />
            : <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
          }
          <span className="max-w-[180px] truncate">
            {uploading ? 'Uploading…' : fileName}
          </span>
          {!uploading && (
            <button
              type="button"
              onClick={clearFile}
              className="ml-0.5 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={ALL_ACCEPTED}
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-[44px] w-[44px] shrink-0 text-muted-foreground hover:text-foreground"
          title="Attach file (PDF, DOCX, PNG, TXT…)"
          disabled={isDisabled}
          onClick={() => fileRef.current?.click()}
        >
          {uploading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Paperclip className="h-4 w-4" />
          }
        </Button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => { setValue(e.target.value); autoResize(e.currentTarget) }}
          onKeyDown={handleKeyDown}
          placeholder="Message Orbit… (Enter to send, Shift+Enter for newline)"
          disabled={isDisabled}
          className="flex-1 min-w-0 resize-none rounded-xl border border-input bg-background px-4 py-2.5
                     text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1
                     focus:ring-ring disabled:opacity-50 min-h-[44px] max-h-[160px] overflow-y-auto"
        />

        <Button
          size="icon"
          onClick={submit}
          disabled={!value.trim() || isDisabled}
          className="h-[44px] w-[44px] flex-none"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
