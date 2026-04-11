// components/panels/TrackerPanel.tsx
// Shows tracker entries extracted from the last AI message.

import { Activity } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TrackerPanelProps {
  entries: string[]
}

export function TrackerPanel({ entries }: TrackerPanelProps) {
  if (entries.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Entries logged
          <Badge variant="secondary" className="ml-auto">{entries.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
            <span className="text-foreground leading-snug">{entry}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
