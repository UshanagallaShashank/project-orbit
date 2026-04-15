// components/panels/TrackerPanel.tsx
// Shows tracker entries extracted from the last AI message with enhanced styling.

import { Activity, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TrackerPanelProps {
  entries: string[]
}

export function TrackerPanel({ entries }: TrackerPanelProps) {
  if (entries.length === 0) return null

  return (
    <Card className="border-border/50 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 overflow-hidden hover:border-border/70 transition-colors">
      <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-900/30 dark:to-transparent">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            Activity Logged
          </span>
          <Badge className="ml-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors">
            {entries.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {entries.map((entry, i) => (
          <div 
            key={i}
            className="flex items-start gap-3 p-2.5 rounded-lg bg-white/40 dark:bg-black/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors border border-transparent hover:border-emerald-200/50 dark:hover:border-emerald-800/50"
          >
            <TrendingUp className="h-4 w-4 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0 animate-pulse" />
            <span className="text-sm text-foreground leading-snug font-medium">{entry}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
