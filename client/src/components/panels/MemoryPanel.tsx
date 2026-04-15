// components/panels/MemoryPanel.tsx
// Shows memories extracted from the last AI message with enhanced styling.

import { BookMarked, Brain } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MemoryPanelProps {
  memories: string[]
}

export function MemoryPanel({ memories }: MemoryPanelProps) {
  if (memories.length === 0) return null

  return (
    <Card className="border-border/50 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 overflow-hidden hover:border-border/70 transition-colors">
      <CardHeader className="pb-3 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-900/30 dark:to-transparent">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40">
            <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Memories Saved
          </span>
          <Badge className="ml-auto bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors">
            {memories.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {memories.map((memory, i) => (
          <div 
            key={i}
            className="flex items-start gap-3 p-2.5 rounded-lg bg-white/40 dark:bg-black/20 hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors border border-transparent hover:border-purple-200/50 dark:hover:border-purple-800/50"
          >
            <BookMarked className="h-4 w-4 text-purple-500 dark:text-purple-400 mt-0.5 shrink-0 animate-pulse" />
            <span className="text-sm text-foreground leading-snug font-medium">{memory}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
