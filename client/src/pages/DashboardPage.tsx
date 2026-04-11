// pages/DashboardPage.tsx
// Overview: stat cards (tasks, entries, memories) + activity bar chart.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckSquare, Activity, BookMarked, MessageSquare } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
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

interface StatCardProps {
  label: string
  count: number
  icon: React.ReactNode
  loading: boolean
  to: string
}

function StatCard({ label, count, icon, loading, to }: StatCardProps) {
  const navigate = useNavigate()
  return (
    <Card
      className="cursor-pointer hover:shadow-sm transition-shadow"
      onClick={() => navigate(to)}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-12" />
        ) : (
          <p className="text-3xl font-bold">{count}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [tasks,    setTasks]    = useState<Task[]>([])
  const [entries,  setEntries]  = useState<TrackerEntry[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      tasksApi.list(),
      trackerApi.list(),
      memoriesApi.list(),
    ]).then(([t, e, m]) => {
      setTasks(t.data)
      setEntries(e.data)
      setMemories(m.data)
    }).finally(() => setLoading(false))
  }, [])

  const activityData = buildActivity(tasks, entries, memories)
  const doneTasks    = tasks.filter((t) => t.done).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {user?.email ? `Hi, ${user.email.split('@')[0]}` : 'Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground">Here is what is happening today.</p>
        </div>
        <Button onClick={() => navigate('/chat')}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Open chat
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total tasks"
          count={tasks.length}
          icon={<CheckSquare className="h-4 w-4" />}
          loading={loading}
          to="/tasks"
        />
        <StatCard
          label="Completed"
          count={doneTasks}
          icon={<CheckSquare className="h-4 w-4" />}
          loading={loading}
          to="/tasks"
        />
        <StatCard
          label="Tracker entries"
          count={entries.length}
          icon={<Activity className="h-4 w-4" />}
          loading={loading}
          to="/tracker"
        />
        <StatCard
          label="Memories"
          count={memories.length}
          icon={<BookMarked className="h-4 w-4" />}
          loading={loading}
          to="/memories"
        />
      </div>

      {/* Activity chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Last 7 days</CardTitle>
          <CardDescription>Tasks added, habits tracked, and memories saved per day.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={activityData} barCategoryGap="30%" barGap={2}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="tasks"    fill="var(--color-tasks)"    radius={[3,3,0,0]} />
              <Bar dataKey="entries"  fill="var(--color-entries)"  radius={[3,3,0,0]} />
              <Bar dataKey="memories" fill="var(--color-memories)" radius={[3,3,0,0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
