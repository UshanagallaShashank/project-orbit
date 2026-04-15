// components/panels/TrackerPanel.tsx
// Renders tracker entries. LeetCode entries get a richer card with
// topic, problem count, difficulty badges, and time. Other entries
// render as a simple text row.

import { Activity, Code2, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TrackerPanelProps {
  entries: string[]
}

interface LCEntry {
  topic:   string
  count:   number | null
  easy:    number | null
  medium:  number | null
  hard:    number | null
  time:    string | null
}

// Parse "LeetCode | Arrays | 5 problems | Easy:3 Medium:2 | 1h"
function parseLCEntry(entry: string): LCEntry | null {
  const trimmed = entry.trim()
  if (!trimmed.toLowerCase().startsWith('leetcode |')) return null

  const parts = trimmed.split('|').map((p) => p.trim())
  // parts[0] = "LeetCode", parts[1] = topic, parts[2..] = rest
  const topic = parts[1] ?? 'Unknown'

  let count:  number | null = null
  let easy:   number | null = null
  let medium: number | null = null
  let hard:   number | null = null
  let time:   string | null = null

  for (const part of parts.slice(2)) {
    const lower = part.toLowerCase()

    // "5 problems"
    const countMatch = lower.match(/^(\d+)\s+problems?$/)
    if (countMatch) { count = parseInt(countMatch[1]); continue }

    // "Easy:3 Medium:2 Hard:1"
    const easyM  = part.match(/Easy:(\d+)/i)
    const medM   = part.match(/Medium:(\d+)/i)
    const hardM  = part.match(/Hard:(\d+)/i)
    if (easyM || medM || hardM) {
      easy   = easyM  ? parseInt(easyM[1])  : null
      medium = medM   ? parseInt(medM[1])   : null
      hard   = hardM  ? parseInt(hardM[1])  : null
      continue
    }

    // "2h" or "1.5h"
    const timeMatch = lower.match(/^(\d+(?:\.\d+)?h)$/)
    if (timeMatch) { time = timeMatch[1]; continue }
  }

  return { topic, count, easy, medium, hard, time }
}

export function TrackerPanel({ entries }: TrackerPanelProps) {
  if (entries.length === 0) return null

  return (
    <Card className="border-slate-700/60 bg-slate-800/60 shadow-none overflow-hidden">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-slate-300">
          <Activity className="h-3.5 w-3.5 text-emerald-400" />
          Activity Logged
          <Badge className="ml-auto bg-emerald-500/10 text-emerald-400 border-0 text-[10px] px-1.5">
            {entries.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 pb-3 space-y-2">
        {entries.map((entry, i) => {
          const lc = parseLCEntry(entry)
          if (lc) {
            return <LCCard key={i} lc={lc} />
          }
          return (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg bg-slate-700/30 px-2.5 py-2 border border-slate-700/40"
            >
              <Activity className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span className="text-xs text-slate-300 leading-snug">{entry}</span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function LCCard({ lc }: { lc: LCEntry }) {
  const totalProblems = lc.count ?? (((lc.easy ?? 0) + (lc.medium ?? 0) + (lc.hard ?? 0)) || null)

  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 px-2.5 py-2 space-y-1.5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Code2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold text-amber-200 truncate">{lc.topic}</span>
        </div>
        <span className="text-[10px] text-amber-400/60 font-medium shrink-0">LeetCode</span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2 flex-wrap">
        {totalProblems !== null && (
          <span className="text-[11px] font-bold text-amber-100">
            {totalProblems} {totalProblems === 1 ? 'problem' : 'problems'}
          </span>
        )}
        {lc.easy   !== null && <DiffBadge label="E" count={lc.easy}   color="text-emerald-400 bg-emerald-500/10 border-emerald-500/20" />}
        {lc.medium !== null && <DiffBadge label="M" count={lc.medium} color="text-amber-400   bg-amber-500/10   border-amber-500/20"   />}
        {lc.hard   !== null && <DiffBadge label="H" count={lc.hard}   color="text-red-400     bg-red-500/10     border-red-500/20"     />}
        {lc.time && (
          <span className="flex items-center gap-0.5 text-[10px] text-slate-400 ml-auto">
            <Clock className="h-2.5 w-2.5" />
            {lc.time}
          </span>
        )}
      </div>
    </div>
  )
}

function DiffBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${color}`}>
      {label} {count}
    </span>
  )
}
