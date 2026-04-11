// pages/TrackerPage.tsx
// Shows habit/goal tracker entries.
// Radar chart: categories detected in entry content (study, exercise, work, etc.)
// Radial chart: streak count for each top category.

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { trackerApi } from '@/api/tracker'
import type { TrackerEntry } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

// Simple keyword -> category mapping for the radar chart
const CATEGORIES: Record<string, string[]> = {
  Study:    ['study', 'learn', 'read', 'course', 'practice', 'leetcode', 'dsa', 'problem'],
  Exercise: ['gym', 'run', 'workout', 'exercise', 'walk', 'swim', 'yoga'],
  Work:     ['work', 'meeting', 'code', 'project', 'pr', 'deploy', 'review'],
  Sleep:    ['sleep', 'rest', 'nap', 'bed'],
  Focus:    ['focus', 'deep', 'flow', 'pomodoro', 'session'],
}

function categorise(entries: TrackerEntry[]): { category: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const cat of Object.keys(CATEGORIES)) counts[cat] = 0

  for (const e of entries) {
    const lower = e.content.toLowerCase()
    for (const [cat, keywords] of Object.entries(CATEGORIES)) {
      if (keywords.some((kw) => lower.includes(kw))) counts[cat]++
    }
  }

  return Object.entries(counts).map(([category, count]) => ({ category, count }))
}

const chartConfig: ChartConfig = {
  count: { label: 'Entries', color: 'var(--chart-1)' },
}

export function TrackerPage() {
  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    trackerApi.list()
      .then((r) => setEntries(r.data))
      .catch(() => toast.error('Failed to load tracker entries'))
      .finally(() => setLoading(false))
  }, [])

  async function remove(id: string) {
    try {
      await trackerApi.delete(id)
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch {
      toast.error('Failed to delete entry')
    }
  }

  const radarData = categorise(entries)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Radar chart */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm">Activity breakdown</CardTitle>
            <CardDescription>Categories across all entries</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <ChartContainer config={chartConfig} className="mx-auto h-[220px]">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, Math.max(...radarData.map((d) => d.count), 1)]} tick={false} axisLine={false} />
                <Radar
                  dataKey="count"
                  fill="var(--color-count)"
                  fillOpacity={0.35}
                  stroke="var(--color-count)"
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Entry list */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">All entries</CardTitle>
              <Badge variant="secondary">{entries.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No entries yet. Log habits in the chat.</p>
            ) : (
              <ul className="space-y-1">
                {entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-muted group"
                  >
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{entry.content}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(entry.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={() => remove(entry.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
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
