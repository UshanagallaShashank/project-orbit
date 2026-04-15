// components/panels/TaskPanel.tsx
// Shows tasks extracted from the last AI message with enhanced styling.

import { CheckSquare, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TaskPanelProps {
  tasks: string[]
}

export function TaskPanel({ tasks }: TaskPanelProps) {
  if (tasks.length === 0) return null

  return (
    <Card className="border-border/50 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 overflow-hidden hover:border-border/70 transition-colors">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/30 dark:to-transparent">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40">
            <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Tasks Logged
          </span>
          <Badge className="ml-auto bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors">
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {tasks.map((task, i) => (
          <div 
            key={i}
            className="flex items-start gap-3 p-2.5 rounded-lg bg-white/40 dark:bg-black/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors border border-transparent hover:border-blue-200/50 dark:hover:border-blue-800/50"
          >
            <CheckCircle2 className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0 animate-pulse" />
            <span className="text-sm text-foreground leading-snug font-medium">{task}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
