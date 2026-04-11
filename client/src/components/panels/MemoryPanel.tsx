// components/panels/MemoryPanel.tsx
// Shows memories extracted from the last AI message.

import { BookMarked } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MemoryPanelProps {
  memories: string[]
}

export function MemoryPanel({ memories }: MemoryPanelProps) {
  if (memories.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BookMarked className="h-4 w-4" />
          Saved to memory
          <Badge variant="secondary" className="ml-auto">{memories.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {memories.map((memory, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
            <span className="text-foreground leading-snug">{memory}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
