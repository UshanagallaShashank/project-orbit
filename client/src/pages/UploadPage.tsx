// pages/UploadPage.tsx
// Resume / document upload hub.
// Drag-and-drop or click to upload .pdf, .txt, .docx files.
// Uploaded docs are stored server-side (text extracted) so future agents
// (ResumeAgent) can read them.

import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { UploadCloud, FileText, Trash2, CheckCircle2 } from 'lucide-react'
import { uploadApi, type UploadedDoc } from '@/api/upload'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'

const ACCEPTED_TYPES = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const ACCEPTED_EXT = '.pdf,.txt,.docx'
const MAX_MB = 10

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadPage() {
  const [docs, setDocs]           = useState<UploadedDoc[]>([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [dragging, setDragging]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    uploadApi.list()
      .then((r) => setDocs(r.data))
      .catch(() => toast.error('Failed to load documents'))
      .finally(() => setLoading(false))
  }, [])

  async function handleFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith('.txt')) {
      toast.error('Unsupported file type. Use PDF, TXT, or DOCX.')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large — max ${MAX_MB} MB`)
      return
    }

    setUploading(true)
    setProgress(10)

    // Simulate progress while uploading
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 15, 85))
    }, 300)

    try {
      const res = await uploadApi.upload(file)
      setDocs((prev) => [res.data, ...prev])
      setProgress(100)
      toast.success(`${file.name} uploaded`)
    } catch {
      toast.error('Upload failed')
    } finally {
      clearInterval(interval)
      setTimeout(() => { setUploading(false); setProgress(0) }, 600)
    }
  }

  async function remove(id: string, filename: string) {
    try {
      await uploadApi.delete(id)
      setDocs((prev) => prev.filter((d) => d.id !== id))
      toast.success(`${filename} deleted`)
    } catch {
      toast.error('Failed to delete document')
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your resume or any document. Orbit will read it and let you chat about it.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2
          border-dashed px-6 py-12 transition-colors
          ${dragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/40'
          }
          ${uploading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXT}
          className="hidden"
          onChange={onInputChange}
        />
        <div className={`rounded-full p-4 ${dragging ? 'bg-primary/10' : 'bg-muted'}`}>
          <UploadCloud className={`h-8 w-8 ${dragging ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {dragging ? 'Drop to upload' : 'Drop a file or click to browse'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, DOCX, TXT — up to {MAX_MB} MB
          </p>
        </div>
        {!uploading && (
          <Button size="sm" variant="secondary" tabIndex={-1}>
            Choose file
          </Button>
        )}
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Uploading…</p>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {/* Uploaded docs list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Uploaded documents</CardTitle>
              <CardDescription>Chat can reference these files.</CardDescription>
            </div>
            <Badge variant="secondary">{docs.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : docs.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No documents yet. Upload one above.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {docs.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 py-3 group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(doc.size_bytes)} · {format(new Date(doc.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={() => remove(doc.id, doc.filename)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
