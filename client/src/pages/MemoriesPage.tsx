// pages/MemoriesPage.tsx
// Lists all saved memories with delete support.

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { memoriesApi } from '@/api/memories'
import type { Memory } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    memoriesApi.list()
      .then((r) => setMemories(r.data))
      .catch(() => toast.error('Failed to load memories'))
      .finally(() => setLoading(false))
  }, [])

  async function remove(id: string) {
    try {
      await memoriesApi.delete(id)
      setMemories((prev) => prev.filter((m) => m.id !== id))
    } catch {
      toast.error('Failed to delete memory')
    }
  }

  return (
    <div className="h-full overflow-y-auto"><div className="space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold">Memories</h1>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Saved facts</CardTitle>
            <Badge variant="secondary">{memories.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : memories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No memories yet. The AI saves important facts automatically during chat.
            </p>
          ) : (
            <ul className="space-y-1">
              {memories.map((memory) => (
                <li
                  key={memory.id}
                  className="flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-muted group"
                >
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{memory.content}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(memory.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={() => remove(memory.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div></div>
  )
}
