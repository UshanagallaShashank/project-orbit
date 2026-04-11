// components/panels/TaskPanel.tsx
// Shows tasks extracted from the last AI message.
// Displayed in the right panel of ChatPage when agent_used = 'task'.

import { CheckSquare } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TaskPanelProps {
  tasks: string[]
}

export function TaskPanel({ tasks }: TaskPanelProps) {
  if (tasks.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          Tasks logged
          <Badge variant="secondary" className="ml-auto">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((task, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
            <span className="text-foreground leading-snug">{task}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
