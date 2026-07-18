// Six stat tiles across the top of the Command Deck, all computed from real run data.
import { Activity, CheckCircle2, Cpu, DollarSign, TrendingUp, Zap } from 'lucide-react';
import { useMemo } from 'react';
import type { AgentRun } from './useAgentRuns';

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export function ReadoutStrip({ runs }: { runs: AgentRun[] }) {
  const stats = useMemo(() => {
    const today = runs.filter((r) => isToday(r.started_at));
    const finished = runs.filter((r) => r.status !== 'running');
    const successRate =
      finished.length > 0
        ? Math.round((finished.filter((r) => r.status === 'success').length / finished.length) * 1000) / 10
        : null;
    const tokens = runs.reduce((sum, r) => sum + (r.tokens_total ?? 0), 0);
    const spend = runs.reduce((sum, r) => sum + (r.cost_usd ?? 0), 0);
    const active = new Set(runs.filter((r) => r.status === 'running').map((r) => r.agent_name)).size;
    const model = runs.find((r) => r.model)?.model ?? 'n/a';
    const sparkSource = [...runs].slice(0, 8).reverse();
    const max = Math.max(1, ...sparkSource.map((r) => r.tokens_total ?? 0));
    const spark = sparkSource.map((r) => ({
      pct: Math.max(8, Math.round(((r.tokens_total ?? 0) / max) * 100)),
      hi: (r.tokens_total ?? 0) > max * 0.6,
    }));
    return { today: today.length, successRate, tokens, spend, active, model, spark };
  }, [runs]);

  const tokensLabel =
    stats.tokens >= 1000 ? `${(stats.tokens / 1000).toFixed(1)}k` : String(stats.tokens);

  return (
    <div className="readout-strip">
      <div className="stat-tile">
        <div className="top">
          <span className="k">Runs today</span>
          <TrendingUp size={12} />
        </div>
        <div className="v">{stats.today}</div>
      </div>
      <div className="stat-tile">
        <div className="top">
          <span className="k">Active</span>
          <Activity size={12} style={{ color: 'var(--signal)' }} />
        </div>
        <div className={`v${stats.active > 0 ? ' hot' : ''}`}>{stats.active}</div>
      </div>
      <div className="stat-tile">
        <div className="top">
          <span className="k">Success</span>
          <CheckCircle2 size={12} style={{ color: 'var(--ok)' }} />
        </div>
        <div className="v good">{stats.successRate != null ? `${stats.successRate}%` : 'n/a'}</div>
      </div>
      <div className="stat-tile">
        <div className="top">
          <span className="k">Tokens</span>
          <Zap size={12} />
        </div>
        <div className="v">{tokensLabel}</div>
        {stats.spark.length > 1 && (
          <div className="spark">
            {stats.spark.map((bar, i) => (
              <i key={i} className={bar.hi ? 'hi' : ''} style={{ height: `${bar.pct}%` }} />
            ))}
          </div>
        )}
      </div>
      <div className="stat-tile">
        <div className="top">
          <span className="k">Spend</span>
          <DollarSign size={12} />
        </div>
        <div className="v">${stats.spend.toFixed(3)}</div>
      </div>
      <div className="stat-tile">
        <div className="top">
          <span className="k">Model</span>
          <Cpu size={12} />
        </div>
        <div className="v" style={{ fontSize: 12.5 }}>{stats.model}</div>
      </div>
    </div>
  );
}
