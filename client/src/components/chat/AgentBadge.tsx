// components/chat/AgentBadge.tsx
// Colored pill showing which agent handled a message.

import { Badge } from '@/components/ui/badge'
import {
  CheckSquare, Activity, Brain, Briefcase, FileText,
  Mic, DollarSign, MessageSquare, Mail, Zap,
} from 'lucide-react'
import type { AgentName } from '@/types'

const AGENT_STYLES: Record<AgentName, string> = {
  general: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  task:    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300',
  tracker: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300',
  memory:  'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/50 dark:text-violet-300',
  mentor:  'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300',
  comms:   'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300',
  job:     'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300',
  resume:  'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300',
  mock:    'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300',
  income:  'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300',
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
  income:  'Income',
}

const AGENT_ICONS: Record<AgentName, React.ComponentType<{ className?: string }>> = {
  general: MessageSquare,
  task:    CheckSquare,
  tracker: Activity,
  memory:  Brain,
  mentor:  Zap,
  comms:   Mail,
  job:     Briefcase,
  resume:  FileText,
  mock:    Mic,
  income:  DollarSign,
}

interface AgentBadgeProps {
  agent: AgentName
}

export function AgentBadge({ agent }: AgentBadgeProps) {
  const Icon = AGENT_ICONS[agent] ?? MessageSquare
  return (
    <Badge className={`gap-1 text-xs font-medium px-2 py-0.5 ${AGENT_STYLES[agent]}`} variant="outline">
      <Icon className="h-3 w-3" />
      {AGENT_LABELS[agent]}
    </Badge>
  )
}
