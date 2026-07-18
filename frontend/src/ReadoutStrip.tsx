// Five-tile instrument readout computed from real run history. Tokens tile carries a recharts
// bar sparkline of the last 7 finished runs' token usage - a real charting library, not
// hand-drawn divs.
import { Activity, Check, TrendingUp } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer } from 'recharts';
import type { AgentRun } from './useAgentRuns';

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export function ReadoutStrip({ runs }: { runs: AgentRun[] }) {
  const todayRuns = runs.filter((r) => isToday(r.started_at));
  const active = runs.filter((r) => r.status === 'running').length;
  const finished = todayRuns.filter((r) => r.status !== 'running');
  const succeeded = finished.filter((r) => r.status === 'success').length;
  const successRate = finished.length ? Math.round((succeeded / finished.length) * 100) : null;
  const totalTokens = todayRuns.reduce((sum, r) => sum + (r.tokens_total ?? 0), 0);
  const totalCostUsd = todayRuns.reduce((sum, r) => sum + (r.cost_usd ?? 0), 0);
  const sparkData = finished
    .slice(0, 7)
    .reverse()
    .map((r, i) => ({ i, v: r.tokens_total ?? 0 }));
  const sparkFallback = Array.from({ length: 7 }, (_, i) => ({ i, v: 0 }));

  const tiles = [
    { key: 'runs', label: 'Runs today', value: todayRuns.length.toString(), icon: <TrendingUp size={14} color="var(--color-text-tertiary)" /> },
    { key: 'active', label: 'Active', value: active.toString(), hot: active > 0, icon: <Activity size={14} color="var(--color-signal)" /> },
    {
      key: 'success',
      label: 'Success',
      value: successRate == null ? '—' : `${successRate}%`,
      ok: true,
      icon: <Check size={14} color="var(--color-success)" />,
    },
    { key: 'tokens', label: 'Tokens', value: totalTokens.toLocaleString(), spark: true },
    { key: 'spend', label: 'Spend', value: `$${totalCostUsd.toFixed(3)}` },
  ];

  return (
    <div className="col-span-2 grid grid-cols-5 gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.key}
          className="rounded-2xl border p-4 transition-transform hover:-translate-y-0.5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-tertiary)' }}>
              {tile.label}
            </span>
            {tile.icon}
          </div>
          <div
            className="mt-2 font-mono text-[28px] font-bold leading-none tabular-nums"
            style={{ color: tile.hot ? 'var(--color-signal)' : tile.ok ? 'var(--color-success)' : 'var(--color-text-primary)' }}
          >
            {tile.value}
          </div>
          {tile.spark && (
            <div className="mt-2.5 h-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sparkData.length ? sparkData : sparkFallback} barCategoryGap={2}>
                  <Bar dataKey="v" radius={1} fill="var(--color-border-bright)" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
