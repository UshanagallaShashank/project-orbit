// pages/TasksPage.tsx
// Lists all tasks with toggle (done/undone) and radial progress chart.

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { tasksApi } from '@/api/tasks'
import type { Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  RadialBarChart,
  RadialBar,
  PolarRadiusAxis,
  Label,
} from 'recharts'
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
  const [tasks, setTasks]   = useState<Task[]>([])
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

  const chartData = [{ done: doneCount, pending: pendingCount }]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Tasks</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Radial progress */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm">Progress</CardTitle>
            <CardDescription>{doneCount} of {tasks.length} completed</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <ChartContainer config={chartConfig} className="mx-auto h-[180px]">
              <RadialBarChart
                data={chartData}
                startAngle={90}
                endAngle={-270}
                innerRadius={55}
                outerRadius={85}
              >
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <PolarRadiusAxis tick={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !('cx' in viewBox)) return null
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} dy="-6" className="fill-foreground text-2xl font-bold">
                            {percent}%
                          </tspan>
                          <tspan x={viewBox.cx} dy="20" className="fill-muted-foreground text-xs">
                            done
                          </tspan>
                        </text>
                      )
                    }}
                  />
                </PolarRadiusAxis>
                <RadialBar dataKey="done"    stackId="a" fill="var(--color-done)"    cornerRadius={6} />
                <RadialBar dataKey="pending" stackId="a" fill="var(--color-pending)" cornerRadius={6} />
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Task list */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">All tasks</CardTitle>
              <Badge variant="secondary">{tasks.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks yet. Ask the AI to add some.</p>
            ) : (
              <ul className="space-y-1">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    onClick={() => toggle(task.id, !task.done)}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted cursor-pointer group"
                  >
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center shrink-0
                        ${task.done
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground group-hover:border-foreground'
                        }`}
                    >
                      {task.done && (
                        <svg className="h-2.5 w-2.5 text-primary-foreground" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm flex-1 ${task.done ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
