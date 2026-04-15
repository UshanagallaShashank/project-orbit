// components/chat/ChatInput.tsx
// Single unified input bar: attach | textarea | send — all inside one border.

import { useState, useRef } from 'react'
import { SendHorizontal, Paperclip, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { uploadApi } from '@/api/upload'
import type { ChatStatus } from '@/types'

interface ChatInputProps {
  status: ChatStatus
  onSend: (text: string) => void
}

const TEXT_EXTS   = ['.txt', '.md', '.csv', '.json', '.py', '.js', '.ts', '.tsx', '.jsx']
const BINARY_EXTS = ['.pdf', '.docx', '.png', '.jpg', '.jpeg', '.webp', '.gif']
const ALL_ACCEPTED = [...TEXT_EXTS, ...BINARY_EXTS].join(',')
const MAX_TEXT_BYTES = 100_000

function isTextFile(name: string) {
  return TEXT_EXTS.some((ext) => name.toLowerCase().endsWith(ext))
}

export function ChatInput({ status, onSend }: ChatInputProps) {
  const [value, setValue]         = useState('')
  const [fileName, setFileName]   = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef     = useRef<HTMLInputElement>(null)
  const isSending   = status === 'sending'
  const isDisabled  = isSending || uploading
  const canSend     = value.trim().length > 0 && !isDisabled

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
    resetHeight()
    textareaRef.current?.focus()
  }

  function resetHeight() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  function clearFile() {
    setFileName(null)
    setValue((prev) => prev.replace(/\n?\[(?:File|Attached):[^\]]+\][\s\S]*?(?=\n\[|$)/, '').trimEnd())
    if (fileRef.current) fileRef.current.value = ''
    textareaRef.current?.focus()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (isTextFile(file.name)) {
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
        setTimeout(() => { if (textareaRef.current) autoResize(textareaRef.current) }, 0)
        textareaRef.current?.focus()
      }
      reader.onerror = () => toast.error('Could not read file')
      reader.readAsText(file)
    } else {
      setUploading(true)
      try {
        await uploadApi.upload(file)
        setFileName(file.name)
        setValue((prev) => {
          const base = prev.trimEnd()
          const ref = `\n[Attached: ${file.name}]`
          return base ? base + ref : ref.trimStart()
        })
        toast.success(`${file.name} uploaded`)
        setTimeout(() => { if (textareaRef.current) autoResize(textareaRef.current) }, 0)
        textareaRef.current?.focus()
      } catch {
        toast.error('Upload failed — check server is running')
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Attached file pill */}
      {(fileName || uploading) && (
        <div className="flex items-center gap-1 self-start rounded-full border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
          {uploading
            ? <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
            : <Paperclip className="h-3 w-3 text-slate-400" />
          }
          <span className="max-w-[160px] truncate">{uploading ? 'Uploading...' : fileName}</span>
          {!uploading && (
            <button onClick={clearFile} className="ml-0.5 text-slate-500 hover:text-slate-300">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Unified input bar */}
      <div className={`flex items-end gap-1 rounded-xl border px-3 py-2 transition-colors
        ${isDisabled
          ? 'border-slate-700/40 bg-slate-800/40'
          : 'border-slate-600 bg-slate-800 focus-within:border-blue-500/60 focus-within:bg-slate-800'
        }`}
      >
        <input ref={fileRef} type="file" accept={ALL_ACCEPTED} className="hidden" onChange={handleFileChange} />

        {/* Attach button */}
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => fileRef.current?.click()}
          title="Attach file"
          className="shrink-0 mb-0.5 p-1 rounded text-slate-500 hover:text-slate-300 disabled:opacity-40 transition-colors"
        >
          {uploading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Paperclip className="h-4 w-4" />
          }
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => { setValue(e.target.value); autoResize(e.currentTarget) }}
          onKeyDown={handleKeyDown}
          placeholder="Message Orbit..."
          disabled={isDisabled}
          className="flex-1 min-w-0 resize-none bg-transparent text-sm text-slate-100
                     placeholder:text-slate-500 focus:outline-none disabled:opacity-50
                     min-h-[24px] max-h-[160px] overflow-y-auto py-0.5 leading-relaxed"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          className={`shrink-0 mb-0.5 p-1.5 rounded-lg transition-all
            ${canSend
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
              : 'text-slate-600 cursor-not-allowed'
            }`}
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>

      <p className="text-[11px] text-slate-600 text-center">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
