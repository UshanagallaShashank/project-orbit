// Full run history table, sourced from the same /agents/runs + /agents/stream data as the
// Command Deck - the deeper, scrollable view of everything Orbit has run.
import { Clock } from 'lucide-react';
import { useState } from 'react';
import { useOrbit } from './OrbitApp';
import { RunInspector } from './RunInspector';
import type { AgentRun } from './useAgentRuns';

function statusColor(status: AgentRun['status']): string {
  if (status === 'success') return 'var(--ok)';
  if (status === 'error') return 'var(--crit)';
  return 'var(--signal)';
}

export function RunHistoryPage() {
  const { runs } = useOrbit();
  const [selected, setSelected] = useState<AgentRun | null>(null);

  return (
    <div>
      <h1 className="page-title">Run history</h1>
      <p className="page-sub">
        Every orchestrator run, newest first. Click a row for the full request, result, and tool
        trace.
      </p>

      {runs.length === 0 ? (
        <div className="empty-state">
          <div className="eicon">
            <Clock size={20} />
          </div>
          <h4>No runs yet</h4>
          <p>Send a request from the Command Deck conversation and it will show up here.</p>
        </div>
      ) : (
        <div className="list-card">
          {runs.map((run) => (
            <button key={run.id} className="run-row" onClick={() => setSelected(run)}>
              <span className="status-dot" style={{ background: statusColor(run.status) }} />
              <span className="agent">{run.agent_name}</span>
              <span className="req">{run.request}</span>
              <span className="when">{new Date(run.started_at).toLocaleTimeString()}</span>
            </button>
          ))}
        </div>
      )}

      <RunInspector run={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
