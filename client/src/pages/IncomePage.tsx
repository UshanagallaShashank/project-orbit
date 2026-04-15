// pages/IncomePage.tsx
// Shows the current month's income, expenses, net balance,
// category breakdown, and a list of all transactions.
// All data is logged via chat — this page just reads and displays it.

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { incomeApi } from '@/api/income'
import type { IncomeEntry, IncomeSummary } from '@/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

// Current month label e.g. "April 2026"
function currentMonthLabel() {
  return new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
}

// Format a number as a short currency string e.g. 150000 -> "1.5L", 5000 -> "5K"
function fmt(n: number) {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
  if (n >= 1000)   return `${(n / 1000).toFixed(1)}K`
  return String(Math.round(n))
}

export function IncomePage() {
  const [entries,  setEntries]  = useState<IncomeEntry[]>([])
  const [summary,  setSummary]  = useState<IncomeSummary | null>(null)
  const [loading,  setLoading]  = useState(true)

  function load() {
    setLoading(true)
    Promise.all([incomeApi.list(), incomeApi.summary()])
      .then(([e, s]) => {
        setEntries(e.data)
        setSummary(s.data)
      })
      .catch(() => toast.error('Failed to load income data'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    try {
      await incomeApi.delete(id)
      setEntries((prev) => prev.filter((e) => e.id !== id))
      // Reload summary since totals change
      incomeApi.summary().then((r) => setSummary(r.data))
      toast.success('Entry deleted')
    } catch {
      toast.error('Failed to delete entry')
    }
  }

  // Build bar chart data from category breakdown
  const chartData = summary
    ? Object.entries(summary.by_category)
        .map(([cat, amt]) => ({ cat, amt }))
        .sort((a, b) => b.amt - a.amt)
        .slice(0, 6)
    : []

  const net      = summary?.net ?? 0
  const netColor = net >= 0 ? 'text-green-600' : 'text-red-500'

  return (
    <div className="h-full overflow-y-auto"><div className="space-y-5 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Income</h1>
        <span className="text-sm text-muted-foreground">{currentMonthLabel()}</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Income',   value: summary?.income   ?? 0, color: 'text-green-600' },
          { label: 'Expenses', value: summary?.expenses ?? 0, color: 'text-red-500'   },
          { label: 'Net',      value: net,                     color: netColor         },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              {loading
                ? <Skeleton className="mt-1 h-7 w-16" />
                : <p className={`mt-1 text-2xl font-semibold ${color}`}>
                    {net < 0 && label === 'Net' ? '-' : ''}{fmt(Math.abs(value))}
                  </p>
              }
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1.6fr]">

        {/* Category bar chart */}
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-sm">By category</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
              </div>
            ) : chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No data yet. Tell Orbit what you spent.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="cat"
                    width={72}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(v: any) => [fmt(v), 'Amount']}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="amt" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {chartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Transaction list */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">Transactions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
              </div>
            ) : entries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No transactions yet. Tell Orbit what you earned or spent.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {entries.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 py-2.5 group">
                    {/* Income / expense badge */}
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 shrink-0 ${
                        e.type === 'income'
                          ? 'border-green-500 text-green-600'
                          : 'border-red-400 text-red-500'
                      }`}
                    >
                      {e.type === 'income' ? '+' : '-'}
                    </Badge>

                    {/* Description + category */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug truncate">
                        {e.description || e.category}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{e.category} · {e.entry_date}</p>
                    </div>

                    {/* Amount */}
                    <span className={`text-sm font-medium shrink-0 ${
                      e.type === 'income' ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {e.type === 'income' ? '+' : '-'}{fmt(e.amount)}
                    </span>

                    {/* Delete button — only visible on hover */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(e.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
