// components/chat/AgentBadge.tsx
// Colored pill showing which agent handled a message.

import { Badge } from '@/components/ui/badge'
import type { AgentName } from '@/types'

const AGENT_STYLES: Record<AgentName, string> = {
  general: 'bg-secondary text-secondary-foreground',
  task:    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  tracker: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  memory:  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  mentor:  'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  comms:   'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  job:     'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  resume:  'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  mock:    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const AGENT_LABELS: Record<AgentName, string> = {
  general: 'General',
  task:    'Task',
  tracker: 'Tracker',
  memory:  'Memory',
  mentor:  'Mentor',
  comms:   'Comms',
  job:     'Job',
  resume:  'Resume',
  mock:    'Mock',
}

interface AgentBadgeProps {
  agent: AgentName
}

export function AgentBadge({ agent }: AgentBadgeProps) {
  return (
    <Badge className={`text-xs font-medium ${AGENT_STYLES[agent]}`} variant="outline">
      {AGENT_LABELS[agent]}
    </Badge>
  )
}
