// pages/TasksPage.tsx
// Task list with progress stats and a compact donut chart.

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { tasksApi } from '@/api/tasks'
import type { Task } from '@/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { PieChart, Pie } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const chartConfig: ChartConfig = {
  done:    { label: 'Completed', color: 'var(--chart-1)' },
  pending: { label: 'Pending',   color: 'var(--chart-2)' },
}

export function TasksPage() {
  const [tasks, setTasks]     = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tasksApi.list()
      .then((r) => setTasks(r.data))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false))
  }, [])

  async function toggle(id: string, done: boolean) {
    try {
      const res = await tasksApi.toggle(id, done)
      setTasks((prev) => prev.map((t) => t.id === id ? res.data : t))
    } catch {
      toast.error('Failed to update task')
    }
  }

  const doneCount    = tasks.filter((t) => t.done).length
  const pendingCount = tasks.length - doneCount
  const percent      = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0

  const chartData = [
    { name: 'done',    value: doneCount,    fill: 'var(--color-done)'    },
    { name: 'pending', value: pendingCount, fill: 'var(--color-pending)' },
  ]

  return (
    <div className="h-full overflow-y-auto"><div className="space-y-5 p-4 md:p-6">
      <h1 className="text-xl font-semibold">Tasks</h1>

      {/* Progress summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',     value: tasks.length  },
          { label: 'Done',      value: doneCount     },
          { label: 'Remaining', value: pendingCount  },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              {loading
                ? <Skeleton className="mt-1 h-7 w-10" />
                : <p className="mt-1 text-2xl font-semibold">{value}</p>
              }
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content: donut + task list side by side */}
      <div className="grid gap-4 md:grid-cols-[200px_1fr]">

        {/* Compact donut */}
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex flex-col items-center gap-3">
            <div className="relative">
              <ChartContainer config={chartConfig} className="h-[130px] w-[130px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={56}
                    dataKey="value"
                    strokeWidth={0}
                  />
                </PieChart>
              </ChartContainer>
              {/* Center label absolutely positioned over the chart */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold leading-none">{percent}%</span>
                <span className="mt-0.5 text-[10px] text-muted-foreground">done</span>
              </div>
            </div>
            <Progress value={percent} className="h-1.5 w-full" />
            <p className="text-xs text-muted-foreground">{doneCount} of {tasks.length} tasks</p>
          </CardContent>
        </Card>

        {/* Task list */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">All tasks</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No tasks yet. Ask Orbit to add some.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    onClick={() => toggle(task.id, !task.done)}
                    className="flex items-center gap-3 py-2.5 cursor-pointer group"
                  >
                    {/* Custom checkbox */}
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded
                        border transition-colors
                        ${task.done
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/40 group-hover:border-foreground'
                        }`}
                    >
                      {task.done && (
                        <svg className="h-2.5 w-2.5 text-primary-foreground" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm flex-1 leading-snug
                        ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                    >
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

      </div>
    </div></div>
  )
}
