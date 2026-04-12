// pages/DashboardPage.tsx
// Overview: stat cards (tasks, entries, memories) + activity bar chart.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { tasksApi } from '@/api/tasks'
import { trackerApi } from '@/api/tracker'
import { memoriesApi } from '@/api/memories'
import { useAuthStore } from '@/stores/authStore'
import type { Task, TrackerEntry, Memory } from '@/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const chartConfig: ChartConfig = {
  tasks:    { label: 'Tasks',    color: 'var(--chart-1)' },
  entries:  { label: 'Entries',  color: 'var(--chart-2)' },
  memories: { label: 'Memories', color: 'var(--chart-3)' },
}

// Build last-7-days activity from created_at timestamps
function buildActivity(
  tasks: Task[],
  entries: TrackerEntry[],
  memories: Memory[],
) {
  return Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i)
    const label = format(day, 'EEE')
    const dayStr = format(day, 'yyyy-MM-dd')

    const t = tasks.filter((x) => x.created_at.startsWith(dayStr)).length
    const e = entries.filter((x) => x.created_at.startsWith(dayStr)).length
    const m = memories.filter((x) => x.created_at.startsWith(dayStr)).length

    return { day: label, tasks: t, entries: e, memories: m }
  })
}


export function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [tasks,    setTasks]    = useState<Task[]>([])
  const [entries,  setEntries]  = useState<TrackerEntry[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  useEffect(() => {
    Promise.all([
      tasksApi.list(),
      trackerApi.list(),
      memoriesApi.list(),
    ]).then(([t, e, m]) => {
      setTasks(t.data)
      setEntries(e.data)
      setMemories(m.data)
    })
  }, [])

  const activityData = buildActivity(tasks, entries, memories)
  const doneTasks    = tasks.filter((t) => t.done).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 min-w-0">
          <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm shadow-slate-600/5">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Welcome back</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {user?.email ? `Hi, ${user.email.split('@')[0]}` : 'Orbit Dashboard'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Your personal AI workspace, now with better summaries, task tracking, and smarter insights.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button size="sm" onClick={() => navigate('/chat')}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Open chat
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/tasks')}>
                View tasks
              </Button>
            </div>
          </div>
        </div>

        <Card className="lg:w-80 shrink-0">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm">Quick stats</CardTitle>
                <CardDescription>Instant insight into your recent activity.</CardDescription>
              </div>
              <Badge variant="secondary">Updated now</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-border bg-background px-4 py-4">
              <p className="text-sm text-muted-foreground">Task total</p>
              <p className="mt-2 text-3xl font-semibold">{tasks.length}</p>
            </div>
            <div className="rounded-3xl border border-border bg-background px-4 py-4">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="mt-2 text-3xl font-semibold">{doneTasks}</p>
            </div>
            <div className="rounded-3xl border border-border bg-background px-4 py-4">
              <p className="text-sm text-muted-foreground">Tracker entries</p>
              <p className="mt-2 text-3xl font-semibold">{entries.length}</p>
            </div>
            <div className="rounded-3xl border border-border bg-background px-4 py-4">
              <p className="text-sm text-muted-foreground">Memories</p>
              <p className="mt-2 text-3xl font-semibold">{memories.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full min-w-0 overflow-hidden">
        <CardHeader className="w-full min-w-0 overflow-hidden">
          <div className="w-full flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between min-w-0 overflow-hidden">
            <div className="w-full min-w-0 overflow-hidden">
              <CardTitle className="text-sm">Activity overview</CardTitle>
              <CardDescription>Weekly summary of tasks, habits, and memories.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(chartConfig).map(([key, config]) => (
                <Badge key={key} variant="outline">{config.label}</Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="w-full min-w-0 overflow-hidden">
          <ChartContainer config={chartConfig} className="w-full h-[240px] min-w-0">
            <BarChart data={activityData} barCategoryGap="30%" barGap={2}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="tasks"    fill="var(--chart-1)"    radius={[6,6,0,0]} />
              <Bar dataKey="entries"  fill="var(--chart-2)"  radius={[6,6,0,0]} />
              <Bar dataKey="memories" fill="var(--chart-3)" radius={[6,6,0,0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
