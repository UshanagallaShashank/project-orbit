// Full run history table, sourced from the same /agents/runs + /agents/stream data as the
// Command Deck's readout strip - the deeper, scrollable view of everything Orbit has run.
import { useState } from 'react';
import { RunInspector } from './RunInspector';
import { useAgentRuns, type AgentRun } from './useAgentRuns';

function statusColor(status: AgentRun['status']): string {
  if (status === 'success') return 'var(--color-success)';
  if (status === 'error') return 'var(--color-danger)';
  return 'var(--color-signal)';
}

export function RunHistoryPage() {
  const { runs } = useAgentRuns();
  const [selected, setSelected] = useState<AgentRun | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Run history
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Every orchestrator run, newest first. Click a row for the full request, result, and tool trace.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--color-border)' }}>
        {runs.length === 0 && (
          <p className="p-4 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            No runs yet.
          </p>
        )}
        {runs.map((run) => (
          <button
            key={run.id}
            onClick={() => setSelected(run)}
            className="flex w-full items-center gap-3 border-b px-4 py-2.5 text-left text-[13px] last:border-b-0 hover:brightness-95"
            style={{ borderColor: 'var(--color-border-soft, var(--color-border))', background: 'var(--color-surface)' }}
          >
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: statusColor(run.status) }} />
            <span className="w-28 flex-shrink-0 truncate font-mono text-[11.5px]" style={{ color: 'var(--color-text-primary)' }}>
              {run.agent_name}
            </span>
            <span className="flex-1 truncate" style={{ color: 'var(--color-text-secondary)' }}>
              {run.request}
            </span>
            <span className="flex-shrink-0 font-mono text-[10.5px]" style={{ color: 'var(--color-text-tertiary)' }}>
              {new Date(run.started_at).toLocaleTimeString()}
            </span>
          </button>
        ))}
      </div>

      <RunInspector run={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
